import {readFileSync} from "fs";
import path from "path";
import YAML from "yaml";
import express from "express";
import {createProxyMiddleware} from "http-proxy-middleware";
import {Server} from "http";

import {Config, Service} from "./types/service";

// reads and parses config file
const readConfigFile = (): Config => {
    const file = readFileSync(path.join(process.cwd(), 'sls-multi-gateways.yml'),  'utf8');
    return YAML.parse(file)
};

// runs each services
const runServices = (
    services: Service[],
    servicePort: number,
    stage: string,
    prefixColors: string[],
    slsCommand: string = 'sls',
    slsArgs: string[] | string = [],
    env: Record<string, string | number | boolean> = {},
) => {
    const commands = [];

    for (let i = 0; i < services.length; i++) {
        const service = services[i];
        const httpPort = service.httpPort || servicePort + i;
        const lambdaPort = service.lambdaPort || httpPort + 1000;
        const serviceStage = service.stage || stage;
        const serviceEnv = {...env, ...(service.env || {})};
        const args = [
            'offline',
            '--stage',
            serviceStage,
            '--httpPort',
            String(httpPort),
            '--lambdaPort',
            String(lambdaPort),
            ...normalizeArgs(slsArgs),
            ...normalizeArgs(service.slsArgs),
        ];
        const envPrefix = Object.keys(serviceEnv)
            .map((key) => `${key}=${shellQuote(String(serviceEnv[key]))}`)
            .join(' ');
        const execCommand = `
            cd ${shellQuote(path.join(process.cwd(), service.srvSource))};
            ${envPrefix ? `${envPrefix} ` : ''}${shellQuote(slsCommand)} ${args.map(shellQuote).join(' ')}
        `;

        commands.push({
            command: execCommand,
            name: service.srvName,
            prefixColor: i < prefixColors.length ? prefixColors[i]: 'gray'
        });
    }

    return commands
}

// proxy each service
const runProxy = (
    services: Service[],
    port: number,
    servicePort: number,
    stage: string,
    prependStageInUrl: boolean = true,
): Server => {
    const app = express();


    for (let i = 0; i < services.length; i++) {
        const service = services[i];
        const proxyPath = `/${service.srvPath}`
        const stripBasePath = service.stripBasePath
        const httpPort = service.httpPort || servicePort + i;
        const serviceStage = service.stage || stage;
        const servicePrependsStage = service.prependStageInUrl !== undefined
            ? service.prependStageInUrl
            : prependStageInUrl;
        const stagePath = servicePrependsStage ? `/${serviceStage}` : '';
        const target = service.target || `http://localhost:${httpPort}${stagePath}`;

        app.use(proxyPath ,createProxyMiddleware({
	        pathRewrite: (path: string) => {
	            return stripBasePath ? path.replace(proxyPath, '/') : path;
            },
            target,
            changeOrigin: true,
        }));
    }

    return app.listen(port, () => {
        console.log(`sls-multi-gateways proxy listening on http://localhost:${port}`);
    });
}

const normalizeArgs = (args: string[] | string | undefined): string[] => {
    if (!args) {
        return [];
    }

    return Array.isArray(args) ? args : splitArgs(args);
}

const splitArgs = (args: string): string[] => {
    const matches = args.match(/(?:[^\s"']+|"[^"]*"|'[^']*')+/g) || [];
    return matches.map((arg) => arg.replace(/^['"]|['"]$/g, ''));
}

const shellQuote = (value: string): string => {
    return `'${value.replace(/'/g, `'\\''`)}'`;
}

export { readConfigFile, runServices, runProxy };
