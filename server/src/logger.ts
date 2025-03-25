import winston from 'winston';
import LokiTransport from 'winston-loki';

const logger = winston.createLogger({
    level: 'info',
    transports: [
        new LokiTransport({
            host: 'http://loki:3100',
            json: true,
            labels: { job: 'server-app' },
            onConnectionError: (err) => console.error('Loki connection error:', err),
        }),
    ],
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format((info) => {
            const { labels, ...rest } = info;
            if (labels) {
                info.labels = { ...labels, job: 'server-app' }; 
            } else {
                info.labels = { job: 'server-app' }; 
            }
    
            info.message = JSON.stringify(rest);
            return info;
        })(),
        winston.format.json()
    ),
});

export default logger;


// import winston from 'winston';
// import LokiTransport from 'winston-loki';

// const logger = winston.createLogger({
//     level: 'info',
//     transports: [
//         new LokiTransport({
//             host: 'http://loki:3100',
//             json: true,
//             labels: { job: 'server-app' },
//             onConnectionError: (err) => console.error('Loki connection error:', err),
//         }),
//     ],
//     format: winston.format.combine(
//         winston.format.timestamp(),
//         winston.format.json()
//     ),
// });

// export default logger;