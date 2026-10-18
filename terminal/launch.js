function createLaunchCommands()
{
	defaultLaunchTargets = 
	[
		{ name: "cyberclicker2101", url: "../cyberclicker2101/index.html", display: true},
		{ name: "flesh", url: "https://flesh.enterprises/index.html", display: false},
		{ name: "fp", url: "../fp/index.html", display: false},
		{ name: "housecall", url: "../housecall/index.html", display: true},
		{ name: "jumpgame", url: "../jumpgame/index.html", display: true},
		{ name: "ragusta", url: "https://ragusta.com/index.html", display: false},
		{ name: "genericinvitation", url: "../genericinvitation/invitation.html", display: false},
		{ name: "genericad", url: "../genericad/digitalSignStart.html", display: false},
		{ name: "seraphims", url: "https://seraphims.org/index.html", display: false},
		{ name: "old", url: "../old/index.html", display: true},
		{ name: "HC2", url: "../HC2/index.html", display: false},
	];

	launchTargets = JSON.parse(JSON.stringify(defaultLaunchTargets));

	if(checkStorage() == true)
	{
		if((localStorage.getItem("userLaunchTargetPreference")) !== null)
		{
			launchTargets = JSON.parse(localStorage.getItem("userLaunchTargetPreference"));
		}
	}

	launchTargets.sort(sortAlphabetically);

	launchCommands = 
	[

	];

	updateLaunchCommands();

	launchCommands.sort(sortAlphabetically);
}

function createLaunchInNewWindowCommands()
{
	openInNewWindowCommands = 
	[
		createBooleanToggleCommand("on", true, null, "userNewWindowPreference", openInNewWindow),
		createBooleanToggleCommand("off", false, null, "userNewWindowPreference", openInNewWindow),
	];

	openInNewWindowCommands.sort(sortAlphabetically);
}

function createEditLaunchCommands()
{
	editLaunchCommands = 
	[
		{
			name: "set",
			display: true,
			argumentsNeeded: 2,
			function: (commandEntered, splitCommand) => 
	        {
	        	if(splitCommand.length > 3)
	        	{
	        		if(launchTargets.find(target => target.name.toLowerCase() === splitCommand[2].toLowerCase()))
					{
						let consoleString = createHistoryMessage("console", ALLOW_WRAP);
						consoleString.innerHTML += "invalid name: " + splitCommand[2] + ", it is already in use";
						printMessage(consoleString, PRINT_MESSAGE_WITHOUT_SPACE);
					}
					else if(!isSafeURL( splitCommand[3]))
					{
						let consoleString = createHistoryMessage("console", PREVENT_WRAP);
						consoleString.innerHTML += "invalid url: " + splitCommand[3] + ", incorrect format";
						printMessage(consoleString, PRINT_MESSAGE_WITH_SPACE);
					}
					else
					{
						launchTargets.push({ name: splitCommand[2], url: splitCommand[3], display: true});

						launchTargets.sort(sortAlphabetically);

						refreshLaunchCommands("set");

						let consoleString = createHistoryMessage("console", PREVENT_WRAP);
						consoleString.innerHTML += "successfully set: " + splitCommand[2] + " " + splitCommand[3];
						printMessage(consoleString, PRINT_MESSAGE_WITH_SPACE);
					}
	        	}
				else
				{
					let consoleString = createHistoryMessage("console", PREVENT_WRAP);
					consoleString.innerHTML += "ex: edlaunch set totalprism https://totalprism.com" + "\n";
					consoleString.appendChild(consoleDecorSeperatorElement(3, false));
					consoleString.innerHTML += "\n     " + "ex: edlaunch set name link";
					printMessage(consoleString, PRINT_MESSAGE_WITH_SPACE);
				}
	        }
		},
		{
			name: "remove",
			display: true,
			argumentsNeeded: 1,
			function: (commandEntered, splitCommand) => 
	        {
				if(splitCommand.length > 2)
				{
					let currentLaunchTarget = launchTargets.find(launchTarget => launchTarget.name.toLowerCase() === splitCommand[2].toLowerCase());

					if(!currentLaunchTarget)
					{
						let consoleString = createHistoryMessage("console", ALLOW_WRAP);
						consoleString.innerHTML += "invalid name: " + splitCommand[2] + ", not found";
						printMessage(consoleString, PRINT_MESSAGE_WITHOUT_SPACE);
					}
					else
					{
						let currentLaunchTargetNameWithCase = currentLaunchTarget.name;
						let launchTargetIndex = launchTargets.findIndex(launchTarget => launchTarget.name.toLowerCase() === currentLaunchTarget.name.toLowerCase());
						launchTargets.splice(launchTargetIndex, 1);

						launchTargets.sort(sortAlphabetically);

						refreshLaunchCommands("set");

						let consoleString = createHistoryMessage("console", ALLOW_WRAP);
						consoleString.innerHTML += "successfully removed: " + currentLaunchTargetNameWithCase;
						printMessage(consoleString, PRINT_MESSAGE_WITHOUT_SPACE);
					}
				}
				else
				{
					let consoleString = createHistoryMessage("console", PREVENT_WRAP);
					consoleString.innerHTML += "ex: edlaunch remove totalprism" + "\n";
					consoleString.appendChild(consoleDecorSeperatorElement(3, false));
					consoleString.innerHTML += "\n     " + "ex: edlaunch remove name";
					printMessage(consoleString, PRINT_MESSAGE_WITH_SPACE);
				}
	        }
		},
		{
			name: "reset",
			display: true,
			argumentsNeeded: 0,
			function: (commandEntered, splitCommand) => 
	        {
				launchTargets = JSON.parse(JSON.stringify(defaultLaunchTargets));

				launchTargets.sort(sortAlphabetically);

				refreshLaunchCommands("remove");

				let consoleString = createHistoryMessage("console", ALLOW_WRAP);
				consoleString.innerHTML += "successfully reset";
				printMessage(consoleString, PRINT_MESSAGE_WITHOUT_SPACE);
	        }
		},
		{
			name: "printlink",
			display: true,
			argumentsNeeded: 1,
			function: (commandEntered, splitCommand) => 
	        {
	        	if(splitCommand.length > 2)
	        	{
	        		let printTarget = launchTargets.find(target => target.name.toLowerCase() === splitCommand[2].toLowerCase());

	        		if(printTarget)
					{
						let consoleString = createHistoryMessage("console", PREVENT_WRAP);
						consoleString.innerHTML += "url: " + printTarget.url;
						printMessage(consoleString, PRINT_MESSAGE_WITH_SPACE);
					}
					else
					{
						let consoleString = createHistoryMessage("console", ALLOW_WRAP);
						consoleString.innerHTML += "invalid name: " + splitCommand[2] + ", not found";
						printMessage(consoleString, PRINT_MESSAGE_WITHOUT_SPACE);
					}
	        	}
	        	else
	        	{
	        		let consoleString = createHistoryMessage("console", PREVENT_WRAP);
					consoleString.innerHTML += "ex: edlaunch printlink totalprism" + "\n";
					consoleString.appendChild(consoleDecorSeperatorElement(3, false));
					consoleString.innerHTML += "\n     " + "ex: edlaunch printlink name";
					printMessage(consoleString, PRINT_MESSAGE_WITH_SPACE);
	        	}
	        }
	    },
		{
			name: "launchinnewpage",
			display: true,
			argumentsNeeded: -1,
			function: (commandEntered, splitCommand) => 
	        {
	        	if(splitCommand.length > 2)
	        	{
	        		executeCommand(commandEntered, splitCommand, 2, openInNewWindowCommands, "edlaunch launchinnewpage argument");
	        	}
	        	else
	        	{
	        		printCommandListOptions(openInNewWindowCommands, "edlaunch launchinnewpage");
	        	}
	        }
	    },
	    {
	    	name: "rename",
			display: true,
			argumentsNeeded: 2,
			function: (commandEntered, splitCommand) => 
			{
				if(splitCommand.length > 3)
				{
					let renameTarget = launchTargets.find(target => target.name.toLowerCase() === splitCommand[2].toLowerCase());

					if(renameTarget)
					{
						let renameTargetNameWithCase = renameTarget.name;

						if(renameTargetNameWithCase === splitCommand[3])
						{
							let consoleString = createHistoryMessage("console", ALLOW_WRAP);
							consoleString.innerHTML += "invalid name: " + splitCommand[3] + ", it is identical";
							printMessage(consoleString, PRINT_MESSAGE_WITHOUT_SPACE);
						}
						else if(splitCommand[2].toLowerCase() === splitCommand[3].toLowerCase())
						{
							renameTarget.name = splitCommand[3];
							refreshLaunchCommands("set");

							let consoleString = createHistoryMessage("console", ALLOW_WRAP);
							consoleString.innerHTML += "successfully renamed: " + renameTargetNameWithCase + " to " + splitCommand[3];
							printMessage(consoleString, PRINT_MESSAGE_WITHOUT_SPACE);
						}
						else if(launchTargets.find(target => target.name.toLowerCase() === splitCommand[3].toLowerCase()))
						{
							let consoleString = createHistoryMessage("console", ALLOW_WRAP);
							consoleString.innerHTML += "invalid name: " + splitCommand[3] + ", it is already in use";
							printMessage(consoleString, PRINT_MESSAGE_WITHOUT_SPACE);
						}
						else
						{
							renameTarget.name = splitCommand[3];
							refreshLaunchCommands("set");

							let consoleString = createHistoryMessage("console", ALLOW_WRAP);
							consoleString.innerHTML += "successfully renamed: " + renameTargetNameWithCase + " to " + splitCommand[3];
							printMessage(consoleString, PRINT_MESSAGE_WITHOUT_SPACE);
						}
					}
					else
					{
						let consoleString = createHistoryMessage("console", ALLOW_WRAP);
						consoleString.innerHTML += "invalid name: " + splitCommand[2] + ", not found";
						printMessage(consoleString, PRINT_MESSAGE_WITHOUT_SPACE);
					}
				}
				else
				{
					let consoleString = createHistoryMessage("console", PREVENT_WRAP);
					consoleString.innerHTML += "ex: edlaunch rename totalprism tp" + "\n";
					consoleString.appendChild(consoleDecorSeperatorElement(3, false));
					consoleString.innerHTML += "\n     " + "ex: edlaunch rename currentname newname";
					printMessage(consoleString, PRINT_MESSAGE_WITH_SPACE);
				}
			}
	    },
	    {
			name: "changelink",
			display: true,
			argumentsNeeded: 2,
			function: (commandEntered, splitCommand) => 
	        {
	        	if(splitCommand.length > 3)
	        	{
	        		let renameTarget = launchTargets.find(target => target.name.toLowerCase() === splitCommand[2].toLowerCase());

					if(renameTarget)
					{
						let renameTargetNameWithCase = renameTarget.name;

						if(!isSafeURL(splitCommand[3]))
						{
							let consoleString = createHistoryMessage("console", PREVENT_WRAP);
							consoleString.innerHTML += "invalid url: " + splitCommand[3] + ", incorrect format";
							printMessage(consoleString, PRINT_MESSAGE_WITH_SPACE);
						}
						else if(renameTarget.url === splitCommand[3])
						{
							let consoleString = createHistoryMessage("console", PREVENT_WRAP);
							consoleString.innerHTML += "invalid url: " + splitCommand[3] + ", it is identical";
							printMessage(consoleString, PRINT_MESSAGE_WITH_SPACE);
						}
						else
						{
							renameTarget.url = splitCommand[3];
							refreshLaunchCommands("set");

							let consoleString = createHistoryMessage("console", ALLOW_WRAP);
							consoleString.innerHTML += "successfully changed link of: " + renameTargetNameWithCase + " to " + splitCommand[3];
							printMessage(consoleString, PRINT_MESSAGE_WITHOUT_SPACE);
						}
					}
					else
					{
						let consoleString = createHistoryMessage("console", ALLOW_WRAP);
						consoleString.innerHTML += "invalid name: " + splitCommand[2] + ", not found";
						printMessage(consoleString, PRINT_MESSAGE_WITHOUT_SPACE);
					}
	        	}
				else
				{
					let consoleString = createHistoryMessage("console", PREVENT_WRAP);
					consoleString.innerHTML += "ex: edlaunch changelink totalprism https://totalprism.com" + "\n";
					consoleString.appendChild(consoleDecorSeperatorElement(3, false));
					consoleString.innerHTML += "\n     " + "ex: edlaunch changelink name link";
					printMessage(consoleString, PRINT_MESSAGE_WITH_SPACE);
				}
	        }
		}
	];

	editLaunchCommands.sort(sortAlphabetically);
}

function refreshLaunchCommands(removeOrSetLocalStorage)
{
	if(checkStorage() == true)
	{
		if(removeOrSetLocalStorage === "remove")
		{
			localStorage.removeItem("userLaunchTargetPreference");
		}
		else
		{
			localStorage.setItem("userLaunchTargetPreference", JSON.stringify(launchTargets));
		}
	}

	launchCommands = 
	[

	];

	updateLaunchCommands();

	launchCommands.sort(sortAlphabetically);
}

function updateLaunchCommands()
{
	for(let i = 0; i < launchTargets.length; i++)
	{
		launchCommands.push({name: launchTargets[i].name, display: launchTargets[i].display, argumentsNeeded: 0, function: () => {launchATarget(launchTargets[i].name);}});
	}
}

function launchATarget(targetName)
{
	launchTarget = launchTargets.find(target => target.name.toLowerCase() === targetName.toLowerCase());

	if(launchTarget)
	{
		if(isSafeURL(launchTarget.url))
		{
			if(openInNewWindow.value === true)
			{
				window.open(launchTarget.url, "_blank");
			}
			else
			{
				window.location.href = launchTarget.url;
			}
		}
		else
		{
			let consoleString = createHistoryMessage("console", ALLOW_WRAP);
			consoleString.innerHTML += "launch aborted, incorrect url format";
			printMessage(consoleString, PRINT_MESSAGE_WITHOUT_SPACE);
		}
	}
	else
	{
		let consoleString = createHistoryMessage("console", ALLOW_WRAP);
		consoleString.innerHTML += "invalid launch argument: " + splitCommand[1];
		printMessage(consoleString, PRINT_MESSAGE_WITHOUT_SPACE);
	}
}