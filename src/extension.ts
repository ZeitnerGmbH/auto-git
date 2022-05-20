/* eslint-disable @typescript-eslint/naming-convention */
'use strict';
import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import * as util from 'util';

import simpleGit, { SimpleGit } from 'simple-git';

let myStatusBarItem: vscode.StatusBarItem;

export function activate(context: vscode.ExtensionContext) {
	let autogit = new AutoGit();
    
    let cmdversion = vscode.commands.registerCommand('autogit.version', () => {
        vscode.window.showInformationMessage('Version 1.1.0 by Eray Sönmez <dev@ray-works.de>');
    });

	let cmdinit = vscode.commands.registerCommand('autogit.init', () => {
		if(autogit.checkWorkspace() && autogit.checkGit()){
			if(!autogit.isInitialized){
				autogit.setup();
				autogit.start();
				vscode.window.showInformationMessage('Auto-Git initialized.');
			} else {
				vscode.window.showInformationMessage('Auto-Git is already initialized.');
			}
		} else {
			vscode.window.showInformationMessage('Auto-Git can only run in a workspace and git-repository.');
		}
	});
    
	let cmdstart = vscode.commands.registerCommand('autogit.start', () => {
		if(autogit.checkWorkspace() && autogit.checkGit()){
            if(autogit.isInitialized){
                if(!autogit.running){
                    autogit.start();
                    vscode.window.showInformationMessage('Auto-Git started.');
                } else {       
                    vscode.window.showInformationMessage('Auto-Git is already running.');
                }
            } else {
                vscode.window.showInformationMessage('Run `Auto-Git: Init` before `Auto-Git: Start`.');
            }
		} else {
			vscode.window.showInformationMessage('Auto-Git can only run in a workspace and git-repository.');
		}
	});

	let cmdstop = vscode.commands.registerCommand('autogit.stop', () => {
		if(autogit.checkWorkspace() && autogit.checkGit()){
			if(autogit.running){
				autogit.stop();
				vscode.window.showInformationMessage('Auto-Git stopped.');
			} else {
				vscode.window.showInformationMessage('Auto-Git is not running.');
			}
		} else {
			vscode.window.showInformationMessage('Auto-Git can only run in a workspace and git-repository.');
		}
	});

	let cmdrestart = vscode.commands.registerCommand('autogit.restart', () => {
		if(autogit.checkWorkspace() && autogit.checkGit()){
            if(autogit.running){
                autogit.stop();
                autogit.start();
                vscode.window.showInformationMessage('Auto-Git restarted.');
            } else {
                 if(autogit.isInitialized){
                    autogit.start();
                    vscode.window.showInformationMessage('Auto-Git restarted.');
                 } else {
                     vscode.window.showInformationMessage('Run `Auto-Git: Init` before `Auto-Git: Restart`.');
                 }
            }
		} else {
			vscode.window.showInformationMessage('Auto-Git can only run in a workspace and git-repository.');
		}
	});

	context.subscriptions.push(cmdinit);
	context.subscriptions.push(cmdversion);
	context.subscriptions.push(cmdstart);
	context.subscriptions.push(cmdstop);
	context.subscriptions.push(cmdrestart);

	if(autogit.isInitialized){
		var cfg = JSON.parse(fs.readFileSync(autogit.cfg, 'utf8'));
		if(cfg.runOnStart){
			autogit.start();
		}
	}

	myStatusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100);
	context.subscriptions.push(myStatusBarItem);
	myStatusBarItem.show();
}

export function deactivate() {

}

class AutoGit implements vscode.Disposable { 
    public counter: number = 0;
    private intervalId: any = null;
    public workspace!: vscode.Uri;
    public running: boolean = false;
    private homedir!: string;
    private logsdir!: string;
    public cfg!: string;
    private gitdir!: string;
    private gitcfg!: string;
	public isInitialized: boolean = false;

    constructor(){
		this.checkWorkspace();
		this.checkGit();

		try {
            fs.statSync(this.cfg);
			this.isInitialized = true;
            var userCfg: any = JSON.parse(fs.readFileSync(this.cfg, 'utf8'));
            var currentCfg: any = this.currentConfigSchema();
            if(!this.compareKeys(userCfg, currentCfg)){
                const newProperties = Object.keys(currentCfg).filter(prop => !userCfg.hasOwnProperty(prop));

                newProperties.forEach(prop => {
                    userCfg[prop] = currentCfg[prop];
                });
                
                fs.writeFileSync(this.cfg, JSON.stringify(userCfg, null, 2));
            }
        } catch (err) {
        }
	}

    dispose(): void {
        this.stop();
    }

    public currentConfigSchema(): object {
        return { 
            "runOnStart": true,
            'updateInterval': 1800,
            'logging': true, 
            'silent': true,
            "commitMessage": "--- Auto Git Commit ---",
            "locale": "en-US",
            "timeZone": "Europe/Berlin"
        };
    }

    private compareKeys(a: object, b: object): boolean {
        var aKeys = Object.keys(a).sort();
        var bKeys = Object.keys(b).sort();
        return JSON.stringify(aKeys) === JSON.stringify(bKeys);
    }

    private updateStatusBarItem(text: string): void {
        myStatusBarItem.text = text;
    }

    public start(): void {
        var cfg = JSON.parse(fs.readFileSync(this.cfg, 'utf8'));
        this.running = true;
        this.counter = cfg.updateInterval;
        this.intervalId = setInterval(() => {
            this.counter--;
            this.updateStatusBarItem("Next Auto-Git in... " + this.counter);
            if(this.counter === 0){
                const git: SimpleGit = simpleGit(this.workspace.fsPath);
                this.updateStatusBarItem("Auto-Git: Checking files...");
                git.pull();
                git.add('.'+ path.sep + '*');
                git.status().then(async (status: any) => { 
                    let changes = status.modified.length + status.created.length + status.deleted.length + status.renamed.length;
                    if(changes > 0){
                        this.updateStatusBarItem("Auto-Git: Pushing files...");

                        let options = { 
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            timeZone: cfg.timeZone ?? 'Europe/Berlin',
                            hour: '2-digit',
                            minute: '2-digit',
                            second: '2-digit',
                        } as const;    

                        var replacements: { [key: string]: string }  = {
                            "{ts}": (new Date().getTime() / 1000).toString(),
                            "{ts.utc}": new Date().toUTCString(),
                            "{ts.iso}": new Date().toISOString(),
                            "{ts.locale}": new Date().toLocaleString(cfg.locale ?? 'en-US', { timeZone: cfg.timeZone ?? 'Europe/Berlin' }),
                            "{ts.locale.date}": new Date().toLocaleDateString(cfg.locale ?? 'en-US', { timeZone: cfg.timeZone ?? 'Europe/Berlin' }),
                            "{ts.locale.time}": new Date().toLocaleTimeString(cfg.locale ?? 'en-US', { timeZone: cfg.timeZone ?? 'Europe/Berlin' }),
                            "{ts.locale.long}": new Date().toLocaleString(cfg.locale ?? 'en-US', options)
                        };

                        cfg.commitMessage = cfg.commitMessage.replace(/\{.+?\}/g, (key: string): string => replacements[key]);

                        await git.commit(cfg.commitMessage ?? "--- Auto-Git Commit ---");
						var remote = status.tracking.split('/')[0] ?? "origin";
						var branch = status.tracking.split('/')[1] ?? "master";
                        await git.push(remote, branch, ['-u']);

                        console.log("[Auto-Git]: Changes since last sync: modified (" + status.modified.length + ") | created (" + status.created.length + ") | deleted (" + status.deleted.length + ") | renamed: (" + status.renamed.length + ")" );
                        if(cfg.logging){
                            var date = new Date();
                            let log = "-------------------- Auto-Git Log --------------------";
                            log += "\n" + date.toString();
                            log += "\n------------------------------------------------------";

                            log += "\n";
                            log += "\nModified files:";
                            log += "\n";
                            status.modified.forEach((element: string) => {
                                log += "* " + element + "\n";
                            });

                            log += "\n";
                            log += "\nCreated files:";
                            log += "\n";
                            status.created.forEach((element: string) => {
                                log += "* " + element + "\n";
                            });

                            log += "\n";
                            log += "\nDeleted files:";
                            log += "\n";
                            status.deleted.forEach((element: string) => {
                                log += "* " + element + "\n";
                            });

                            log += "\n";
                            log += "\nRenamed files:";
                            log += "\n";
                            status.renamed.forEach((element: string) => {
                                log += "* " + element + "\n";
                            });

                            fs.writeFileSync(this.logsdir + path.sep + 'log-' + date.getDate() + '-' + date.getMonth() + '-' + date.getFullYear() + '-' + date.getHours() + '-' + date.getMinutes() + '-' + date.getSeconds() + '.txt', log);
                        }
                        if(!cfg.silent){
                            vscode.window.showInformationMessage("Auto-Git updated " + changes + " change(s)."); 
                        }

                        this.updateStatusBarItem("Auto-Git: Push done. Starting next cycle...");
                    }
                });

                clearInterval(this.intervalId);
                this.intervalId = null;
                setTimeout(() => {
                    this.start();
                }, 5000);
            }
        }, 1000);
    }

    public stop(): void {
        if(this.running){
            clearInterval(this.intervalId);
            this.intervalId = null;
            this.running = false;
            this.updateStatusBarItem("--- Auto-Git not running ---");
        }
    }

    public setup() {
        try{
            fs.statSync(this.homedir);
        } catch (err) {
            fs.mkdirSync(this.homedir);
        }

        try{
            fs.statSync(this.logsdir);
        } catch (err) {
            fs.mkdirSync(this.logsdir);
        }

        try {
            fs.statSync(this.cfg);
        } catch (err) {
            fs.writeFileSync(this.cfg, JSON.stringify(this.currentConfigSchema(), null, 2));
        }

        try{
            fs.statSync(this.workspace.fsPath.concat(path.sep + '.gitignore'));
        }catch(err){
            fs.writeFileSync(this.workspace.fsPath.concat(path.sep + '.gitignore'), '.autogit');
        }

        let gitignore = fs.readFileSync(this.workspace.fsPath.concat(path.sep + '.gitignore'));
        if(gitignore.indexOf('.autogit') === -1) {
            fs.appendFileSync(this.workspace.fsPath.concat('.gitignore'), '.autogit');
        }

		this.isInitialized = true;
    }

    public checkGit(): boolean {
        try {
            fs.statSync(this.gitdir);
            fs.statSync(this.gitcfg);
            console.log('[Auto-Git] [OK]: Workspace is a git repository.');
            return true;
        }
        catch (err) {
            console.log('[Auto-Git] [Error]: Workspace is not a git repository, disabling extension.');
            return false;
        }
    }

    public checkWorkspace(): boolean {
        try {
			if(vscode.workspace.workspaceFolders !== undefined){
				fs.statSync(vscode.workspace.workspaceFolders[0].uri.fsPath );
				console.log('[Auto-Git] [OK]: Workspace found: ' + vscode.workspace.workspaceFolders[0].uri.fsPath);
				this.workspace = vscode.workspace.workspaceFolders[0].uri;
				
				this.homedir = this.workspace.fsPath.concat(path.sep + '.autogit');
				this.logsdir = this.workspace.fsPath.concat(path.sep + '.autogit/logs');
				this.cfg = this.workspace.fsPath.concat(path.sep + '.autogit/autogit.json');
				this.gitdir = this.workspace.fsPath.concat(path.sep + '.git');
				this.gitcfg = this.workspace.fsPath.concat(path.sep + '.git/config');

				return true;
			} else {
				console.log('[Auto-Git] [Error]: No workspace found, disabling extension.');
			}
        }
        catch (err) {
            console.log('[Auto-Git] [Error]: No workspace found, disabling extension.');
		}
		return false;
    }
}