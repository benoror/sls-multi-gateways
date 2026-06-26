#!/usr/bin/env node

import concurrently from 'concurrently';
import {readConfigFile, runProxy, runServices} from "./handler";
import {Service} from "./types/service";


const prefixColors = [
    'blue', 'green', 'magenta', 'cyan', 'white', 'gray', 'yellow', 'red'
];

const file = readConfigFile()

const services = file.services as Service[];
const port = file.port || 3000;
const servicePort = file.servicePort || 3001;
const stage = file.stage || 'dev';
const prependStageInUrl = file.prependStageInUrl !== undefined ? file.prependStageInUrl : true;

const commands = runServices(
    services,
    servicePort,
    stage,
    prefixColors,
    file.slsCommand,
    file.slsArgs,
    file.env,
);

const proxyServer = runProxy(services, port, servicePort, stage, prependStageInUrl);

concurrently(commands, {
   killOthers: ['failure', 'success']
}).then(
    () => {
        proxyServer.close(() => process.exit(0));
    },
    (error) => {
        proxyServer.close(() => process.exit(error ? 1 : 0));
    },
)


process.on('SIGINT', () => {
    console.log("")
    proxyServer.close(() => process.exit(1));
});