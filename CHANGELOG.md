# Change Log

### 1.1.0

[Added] Auto-Git is not loading automatically anymore when a **new** workspace is opened. You need to initialized Auto-Git first. This behavior provides more flexibility when to use Auto-Git. Initialization can only be done in a workspace, which is a git-repository. After initialization, its set up by default to run/start when this workspace is opened again. You can change this behavior by changing "runOnStart" to false in the **autogit.json** config file.

[Added] runOnStart: Run Auto-Git automatically when opening a workspace (which is a git-repository) which already has been initialized for Auto-Git.

[Added] commitMessage: You are now able to set your own commit message which should be used for auto-git pushes.

[Fixed] Auto-Git fails to push on some machines with non-standard git configuration.

[Modified] README.md extended with more information. Description for the configuration file and adjusted formatting.
