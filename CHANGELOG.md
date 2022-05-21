# Change Log

## 1.1.4

* Preloading extension to prevent restart of vscode when working in an empty workspace without any files.
* Cleaned up unnecessary imports
* Improved performance

## 1.1.3

* Adjusted CHANGELOG.md and README.md for more readability
* Adjusted extension information for marketplace (added tags/keywords)
* Adjusted VSCode Activation Events For Extensions. Auto-Git will now only loaded from VSCode when a folder/workspace is opened.
* Standard locale is now en-US

## 1.1.2

* Added following placeholders for custom commit messages has been implemented:

```
{ts} represents seconds (as integer) from 1970-01-01 till now (unix timestamp)

{ts.utc} represents the UTC format e.g.: Fri, 20 May 2022 20:05:12 GMT

{ts.iso} represents the ISO format e.g.: 2022-05-20T20:05:12.072Z

{ts.locale} represents the locale format with timeZone and locale e.g. for Europe/Berlin and de-DE: 20.5.2022, 22:05:12

{ts.locale.date} represents the date only e.g. for Europe/Berlin and de-DE: 20.5.2022

{ts.locale.time} represents the time only e.g. for Europe/Berlin and de-DE: 22:05:12

{ts.locale.long} represents the date and time as long format e.g. for Europe/Berlin and de-DE: Freitag, 20. Mai 2022, 22:05:12
```

* Added `locale` and `timeZone` added to autogit.json configuration file and are used for the placeholders only in the custom commit message. 
  
    locale format specification: [BCP 47](https://datatracker.ietf.org/doc/html/rfc4647#section-3.3.2)

    example: de-DE (German, as used in Germany), ar-DZ (Arabic, as used in Algeria), ar-EG (Arabic, as used in Egypt), fr-VU (French, as used in Vanuatu), [Language designators with regions](https://lingohub.com/developers/supported-locales/language-designators-with-regions)

    timeZone format specification: IANA TimeZone [List_of_tz_database_time_zones](https://en.wikipedia.org/wiki/List_of_tz_database_time_zones)

## 1.1.0

* Added Auto-Git is not loading automatically anymore when a **new** workspace is opened. You need to initialized Auto-Git first. This behavior provides more flexibility when to use Auto-Git. Initialization can only be done in a workspace, which is a git-repository. After initialization, its set up by default to run/start when this workspace is opened again. You can change this behavior by changing "runOnStart" to false in the **autogit.json** config file.

* Added runOnStart: Run Auto-Git automatically when opening a workspace (which is a git-repository) which already has been initialized for Auto-Git.

* Added commitMessage: You are now able to set your own commit message which should be used for auto-git pushes.

* Fixed Auto-Git fails to push on some machines with non-standard git configuration.

* Adjusted the README.md file and added more information, description for the configuration file. Also some formatting.
