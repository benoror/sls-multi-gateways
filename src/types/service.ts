export interface Service {
    srvName: string;
    srvSource: string;
    srvPath: string;
    stripBasePath?: boolean;
    httpPort?: number;
    lambdaPort?: number;
    stage?: string;
    prependStageInUrl?: boolean;
    slsArgs?: string[] | string;
    env?: Record<string, string | number | boolean>;
    target?: string;
}

export interface Config {
    port?: number;
    servicePort?: number;
    stage?: string;
    prependStageInUrl?: boolean;
    slsCommand?: string;
    slsArgs?: string[] | string;
    env?: Record<string, string | number | boolean>;
    services: Service[];
}
