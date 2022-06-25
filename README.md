package.json changed type to module to support ECMAScript module system (use import not require)

// https://docs.aws.amazon.com/en_us/AWSJavaScriptSDK/v3/latest/clients/client-cloudwatch-logs/classes/filterlogeventscommand.html

//check if stream out
https://stackoverflow.com/questions/15466383/how-to-detect-if-a-node-js-script-is-running-through-a-shell-pipe

see curl --help for inspiration

```bash
# search the past 10mins by default
cl <log group name>

# search the past 30m
cl <log group name> -s 30m

# search the past 1d
cl <log group name> -s 1d

cl <log group name> -s T1700

cl <log group name> -s 0108T1700

cl <log group name> -s 0108T1700 -e 0208T1300
```

## Integration with zsh

### tldr - I want BLAZINGLY FAST CLOUDWATCH LOGGING. just tell me what to do NOW

the cloudwatch logging problem consists of 2 parts

There are many cloudwatch logs, and i don’t quite remember the name of a particular couldwatch log i want to search

Once I know which cloudwatch log I want to search, I want to be able to provide a time range very easily and with the least keystrokes possible

It is best to solve both problems but if you must, you can just install https://github.com/tg0h/awslogs to solve the second problem.

- For the first problem of finding the cloudwatch log to search.

  - install fzf here , (just brew install fzf)
    - fzf helps you fuzzy search a list
    - Now you have a searcher, You need something to search. For that, create a cache of cloudwatch logs. This is simply a text file with a list of cloudwatch log group names. here
    - for extra points, you will also be setting up a zsh shortcut to call fzf. see here
    - for even more points, create a function to refresh your cache. see here

- For the second problem of filtering any particular cloudwatch log - install cl here (sorry i don’t know how to turn this into a homebrew package. you’re a js pro, npm install this)

YOU ARE NOW A CLI WIZARD. spread the word. Tell glenn to stop mucking about in the console.

### tell me more - How and why did you do it this way? 🤔

#### cloudwatch cli tools available in the wild - pick your poison

##### aws cli 💩

```bash
# what are the log groups I can query?
aws logs describe-log-groups | jq '.logGroups[].logGroupName'

# in each log group, what are the log streams?
aws logs describe-log-streams --log-group-name <logGroupName>

# finally, lets get the logs !!!
aws logs get-log-events --log-group-name <logGroupName> --log-stream-name <logStreamName>

# This is too much work!!!!!
use a cli tool to query cloudwatch instead - better than awscli but does not support SG time… what!
```

##### bastida’s awslogs

https://github.com/jorgebastida/awslogs

```bash
# much better - provide a date to start with
# but you need to provide UTC time, not SG time... zzzzz
# give me the logs from sg 25 jun 1430H onwards
# --timestamp means give me the log timestamp
awslogs get /aws/lambda/***REMOVED*** --start='25/6/2022 06:30' --timestamp

# give me the logs from 2 minutes ago
awslogs get /aws/lambda/***REMOVED*** --start='2m' --timestamp
```

##### timg’s cl 👈️ is the 💣️

https://github.com/tg0h/awslogs - choose this !!! (unbiased)

```bash
# give me logs starting from 2 minutes ago
cl /aws/lambda/***REMOVED*** -s 2m

# give me logs since 1430H today
cl /aws/lambda/***REMOVED*** -s 1430H
cl /aws/lambda/***REMOVED*** -s T1430

# give me the logs from 24 jun 230pm to 24 jun 232pm
cl /aws/lambda/***REMOVED*** -s 2406T1430 -e 2406T1432

# (i don't support year in the date format so if yesterday was 31 december
# ... tough loll...)
```

### I feel the need. The need for speed.

Searching for something to search

This creates a cache of cloudwatch logs for zsh to search. Keep this in a safe place.

```bash
# run this aws command to create a file containing a list of all the cloudwatch log group names
# you better have jq installed, unless you like java and xml, then stop reading this guide and go find something on maven
# you don't need this guide. you don't need speed.
# put this file in a safe place
# if you want a suggestion.... have you heard about xdg ??
# The environment variable contains a path to your cache, eg ~/.local/state/candy/cloudwatch/logGroups, but hey
# do what you want man

aws logs describe-log-groups | jq --raw-output '.logGroups[].logGroupName' > $CANDY_CLOUDWATCH_LOGGROUPS_STATE
```

#### Short circuit your search with keyboard shortcuts

Do this if you want to create a keyboard shortcut in zsh to call fzf to search your cloudwatch logs. Its what Maverick would do.

This defines a zsh widget

```bash
#!/bin/zsh
# the filename of this file must be fzf-search-cloudwatch-logs-widget
# (it must be the same as the zsh function name)
# this zsh widget simply cats a file and feeds it to fzf
# a zsh widget is a a zsh function that talks to zle
# why so complicated ? because we want a shortcut key to paste the result of this function
# into the current prompt.
# LBUFFER refers to the current line in zsh

function fzf-search-cloudwatch-logs-widget() {

# select and put a cloudwatch log group in current buffer
# $CANDY_CLOUDWATCH_LOGGROUPS_STATE is an environment variable
# that contains the path to my cache file
# for me, it is ~/.local/state/candy/cloudwatch/logGroups
# but hey, its your OS, you decide where you want your cache file to be

local result=$(cat $CANDY_CLOUDWATCH_LOGGROUPS_STATE | fzf)
  zle reset-prompt
  LBUFFER+=$result
}

fzf-search-cloudwatch-logs-widget
```

This binds a keymap to your zsh widget above

```bash
# you may need to remove the default ctrl s bindkey before defining your cloudwatch log widget
# bindkey -r "^S"
# define the widget and bind it to ctrl s, ctrl t (hey, you can define another shortcut if you want)
# in zsh, you can run the bindkey command to see what your existing shortcuts are
# how to read the output of the bindkey command
# ^ means ctrl
# ^[ means opt
# eg, you might have ^[B or opt-b bound to the backward-word widget.

zle -N fzf-search-cloudwatch-logs-widget
bindkey '^s^t' fzf-search-cloudwatch-logs-widget
```

#### My cache is stale, but my style is impetuous

Call this function to refresh your cache of cloudwatch logs. FASTERRRRR.

```bash
#!/bin/zsh

function cwr(){
 # refresh the cloudwatch loggroups
aws logs describe-log-groups | jq --raw-output '.logGroups[].logGroupName' > $CANDY_CLOUDWATCH_LOGGROUPS_STATE
}
```
