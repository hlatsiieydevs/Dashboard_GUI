const fs = require('fs');
const path = require('path');

// Determine logs directory (prefer /app/logs in container or ../../logs / ./logs locally)
const logsDir = process.env.LOG_DIR 
    || (fs.existsSync('/app') ? '/app/logs' : path.join(__dirname, '../../logs'));

if (!fs.existsSync(logsDir)) {
    try {
        fs.mkdirSync(logsDir, { recursive: true });
    } catch (e) {
        console.error('Failed to create logs directory:', e.message);
    }
}

function getLogFileName() {
    const today = new Date().toISOString().split('T')[0];
    return path.join(logsDir, `dashboard-${today}.log`);
}

function formatLog(level, moduleName, message, extra = null) {
    const timestampz = new Date().toISOString();
    let formatted = `[${timestampz}] [${level.toUpperCase()}] [${moduleName}] ${message}`;
    if (extra) {
        formatted += ` | Extra: ${typeof extra === 'object' ? JSON.stringify(extra) : extra}`;
    }
    return formatted;
}

function writeToFile(logLine) {
    try {
        const file = getLogFileName();
        fs.appendFileSync(file, logLine + '\n', 'utf8');
    } catch (e) {
        console.error('Failed to write to log file:', e.message);
    }
}

function parseAxiosError(error) {
    if (error && error.isAxiosError) {
        return {
            status: error.response?.status || 'NO_RESPONSE',
            statusText: error.response?.statusText || '',
            code: error.code || 'UNKNOWN',
            url: error.config?.url || '',
            message: error.message
        };
    }
    return { message: error?.message || String(error) };
}

const logger = {
    info(moduleName, message, extra = null) {
        const logLine = formatLog('INFO', moduleName, message, extra);
        console.log(logLine);
        writeToFile(logLine);
    },
    warn(moduleName, message, extra = null) {
        const logLine = formatLog('WARN', moduleName, message, extra);
        console.warn(logLine);
        writeToFile(logLine);
    },
    error(moduleName, message, error = null) {
        let cleanError = null;
        if (error) {
            cleanError = parseAxiosError(error);
        }
        const logLine = formatLog('ERROR', moduleName, message, cleanError);
        console.error(logLine);
        writeToFile(logLine);
    },
    debug(moduleName, message, extra = null) {
        const logLine = formatLog('DEBUG', moduleName, message, extra);
        console.log(logLine);
        writeToFile(logLine);
    }
};

module.exports = logger;
