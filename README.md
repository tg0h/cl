package.json changed type to module to support ECMAScript module system (use import not require)

// https://docs.aws.amazon.com/en_us/AWSJavaScriptSDK/v3/latest/clients/client-cloudwatch-logs/classes/filterlogeventscommand.html

//check if stream out
https://stackoverflow.com/questions/15466383/how-to-detect-if-a-node-js-script-is-running-through-a-shell-pipe

see curl --help for inspiration

``` bash
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
