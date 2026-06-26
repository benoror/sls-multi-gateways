# sls-multi-gateways
sls-multi-gateways is a tool that allows you to run multiple api gateways under one domain for local development purposes. <br /><br />
[Here is a walkthrough article on medium](https://medium.com/@edisgonuler/run-multiple-serverless-applications-d8b38ef04f37)

## Installation
sls-multi-gateways can be run with `npx`:

```bash
npx sls-multi-gateways
```

or installed globally:

```bash
npm install -g sls-multi-gateways
```

## Usage
After installing sls-multi-gateways, cd into your project directory
```bash
cd [project-directory]
```

Create a sls-multi-gateways config file
```bash
touch sls-multi-gateways.yml
```

Inside your sls-multi-gateways config file add the services you would like to run
```yaml
port: 3000 # proxy port
servicePort: 3001 # first serverless-offline HTTP port
stage: dev
prependStageInUrl: true
slsArgs:
  - --noAuth
env:
  AWS_REGION: us-east-2
services:
  - srvName: users
    srvPath: admin-panel-users
    srvSource: services/users
    stripBasePath: true
    httpPort: 3009
    lambdaPort: 4009
    slsArgs:
      - --useInProcess
    env:
      TRIVELTA_DEBUG: "true"
```


All srvPaths by default are mapped to ```localhost:[port]/[srvPath]```. To remove ```srvPath``` before forwarding to the service, set ```stripBasePath``` to ```true```.
<br /><br /> 

## Configuration

Top-level options:

- `port`: public proxy port. Defaults to `3000`.
- `servicePort`: first `serverless-offline` HTTP port. Defaults to `3001`; each service without `httpPort` gets `servicePort + index`.
- `stage`: Serverless stage. Defaults to `dev`.
- `prependStageInUrl`: whether proxied targets include `/<stage>`. Defaults to `true`, matching serverless-offline's default URL shape.
- `slsCommand`: Serverless command. Defaults to `sls`.
- `slsArgs`: extra arguments passed to every `sls offline` process, as a string or list.
- `env`: environment variables applied to every service process.

Service options:

- `srvName`: service label used in logs.
- `srvPath`: public path prefix handled by this service.
- `srvSource`: directory containing that service's `serverless.yml`.
- `stripBasePath`: remove `srvPath` before proxying.
- `httpPort`: explicit `serverless-offline` HTTP port for this service.
- `lambdaPort`: explicit `serverless-offline` Lambda invoke port for this service.
- `stage`: per-service stage override.
- `prependStageInUrl`: per-service stage-prefix override.
- `slsArgs`: per-service extra `sls offline` arguments.
- `env`: per-service environment variables.
- `target`: fully custom proxy target, if the generated local target is not enough.

To run sls-multi-gateways, execute the following cmd in the directory with the config file

```bash
sls-multi-gateways
```

