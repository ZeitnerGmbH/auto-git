# Required VS-Code Version

1.67.0

# Auto-Git

Auto-Git is an extension to push project files to git in a predefined interval without taking any action by the developer.

## What is new?

### 1.1.0

[Added] Auto-Git is not loading automatically anymore when a **new** workspace is opened. You need to initialized Auto-Git first. This behavior provides more flexibility when to use Auto-Git. Initialization can only be done in a workspace, which is a git-repository. After initialization, its set up by default to run/start when this workspace is opened again. You can change this behavior by changing "runOnStart" to false in the **autogit.json** config file.

[Added] runOnStart: Run Auto-Git automatically when opening a workspace (which is a git-repository) which already has been initialized for Auto-Git.

[Added] commitMessage: You are now able to set your own commit message which should be used for auto-git pushes.

[Fixed] Auto-Git fails push on some machines with non-standard git configuration.

[Modified] README.md extended with more information. Description for the configuration file and adjusted formatting.

## Getting Started

When you install Auto-Git, it will look for a workspace/folder which has to be a git-repository. If not, the extension will be disabled automatically. So make sure you work in a git-repository. This extension will also append his own directories into the .gitignore file to prevent getting uploaded to the git. If you dont have a .gitignore file, one will be created by default.

### Prerequisites

Using Auto-Git from scratch with a fresh git repository.

Your steps are easy and also a common route to work with git: make a git repository with init, setup remote data and choose upstream branch

```
git init
git remote add origin <url>
git fetch origin
git pull origin master
git branch --set-upstream-to=origin/master
```

If you are working within another branch beside master, so do not forget to switch into it using:

```
git checkout <branch>
```

I would prefer to use the git credential.helper for remembering username and password for the remote git.

Linux:

```
git config --global credential.helper store
or
git config --global credential.helper cache
```

MacOSX:

```
git config --global credential.helper osxkeychain
```

Windows:
For Windows, there is a helper called [Git Credential Manager for Windows](https://github.com/Microsoft/Git-Credential-Manager-for-Windows) by Microsoft

```
git config --global credential.helper wincred # obsolete
```

also do not forget to setup user.name and user.email

```
git config --global user.name "Your Full Name"
git config --global user.email "your@email.com"
```

After you created a git-repository, restart Visual Studio Code or reopen the workspace/folder. The extension recognizes it as a git repository and start automatically with predefined settings.

## Settings

There will be a **.autogit** directory with logs folder and a **autogit.json** file. You can change some behavoir like interval, logging and silent-mode in the json file.
After changing any value in the json file, you should stop and start the extension to reload the configuration. This can be done by restarting VS Code or using the extension commands.

```
runOnStart: If true, auto-git will automatically start push cycle by given interval (see below `updateInterval`) when opening workspace (which is a git-repository).
logging: Creates a log file (date based) in the .autogit/logs folder. It contains all changes from last push cycle (add/remove/modified/delete). So you can always see what happened during the push cycle. Setting to false will prevent creating log files.
silent: If false, every finished push cycle, a vscode notification box will show up.
updateInterval: interval is given in seconds. Defines how long a cycle takes to push added/removed/modified/deleted files to git.
commitMessage: Here you can override the default auto-git commit message.
```

## Commands

Press F1 or CTRL+Shift+P to open VS Code Command Palette.

- Auto-Git: Version // Shows current installed version in a notification box
- Auto-Git: Init // Initializes Auto-Git for your Project
- Auto-Git: Start // Starts the interval and routine
- Auto-Git: Stop // Stops the interval and routine
- Auto-Git: Restart // Reloads configuration + Stop + Start

## Authors

- **Eray Sönmez** - _Lead Developer_ - [Zeitner GmbH](https://www.zeitnergmbh.de)

Written in TypeScript with love. This extension is a product of Zeitner GmbH.

## License

This project is licensed under the GPL v3 License - see the LICENSE.md file for details

## Thirdparty Libraries

- Simple-Git
