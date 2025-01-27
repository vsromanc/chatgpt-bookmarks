import loglevel, { LogLevelDesc } from 'loglevel';

const originalFactory = loglevel.methodFactory;

loglevel.methodFactory = function (methodName, logLevel, loggerName) {
    const rawMethod = originalFactory(methodName, logLevel, loggerName);

    return function (this: typeof loglevel, ...args) {
        const prefix = `[${process.env.APP_NAME}]`; // Static prefix
        const modifiedArgs = [...args];

        if (modifiedArgs.length > 0) {
            modifiedArgs[0] = `${prefix}${String(modifiedArgs[0]).startsWith('[') ? '' : ' '}${modifiedArgs[0]}`;
        } else {
            // If no arguments, add the prefix as the message
            modifiedArgs.push(prefix);
        }

        rawMethod.apply(this, modifiedArgs);
    };
};

loglevel.setLevel(process.env.LOG_LEVEL as LogLevelDesc);

export default loglevel;
