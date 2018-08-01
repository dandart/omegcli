# Omegcli

[![Greenkeeper badge](https://badges.greenkeeper.io/danwdart/omegcli.svg)](https://greenkeeper.io/)

## Version 0.5

Uses the Omegle API to chat to people.

TODO: Giving up and trying randoms, cameras.

Uses readline to do so, and uses notify-send when available.

Licence: WTFPL

## Usage

Copy and edit `config.sample.json` and call it `config.json`.
`"likes"` are common shared topics and `"phrases"` are quick commands/shortcuts,
usable like:

```
> /hi
You: Hello there!
>
```

If you specify a phrase called `"start"` it will be run when you connect.

The option `"log"` specifies whether you would like to create a log file in the `logs/` directory for each conversation.

## More Info

Warning: This program will die unexpectedly all the time due to lack of decent error checking.

Works for me, YMMV.

No warranty, blah blah blah.

I do not claim any copy rights, rites, writes, wrongs or wongs, or hold any trade marks, warks, tarts, farts or plarts against Omegle. They own the backends that this uses.

Written from scratch (ish) using request libraries.

This isn't new, people have been doing this for a while so I hope I'm not being naughty by releasing this.

See also:

https://github.com/nikkiii/omegle-api-java
