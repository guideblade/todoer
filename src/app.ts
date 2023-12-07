process.env.YDB_SDK_PRETTY_LOGS = '1';

import express from 'express';
import path from 'path';
import os from 'os';

import {
    Column,
    Driver,
    getCredentialsFromEnv,
    Logger,
    Session,
    TableDescription,
    TableIndex,
    Types,
    withRetries,
} from 'ydb-sdk';
import {main, SYNTAX_V1} from '../src/utils/utils';

const SERIES_TABLE = 'series';
const SEASONS_TABLE = 'seasons';
const EPISODES_TABLE = 'episodes';

async function createTables(session: Session, logger: Logger) {
    logger.info('Dropping old tables...');
    await session.dropTable(SERIES_TABLE);
    await session.dropTable(EPISODES_TABLE);
    await session.dropTable(SEASONS_TABLE);

    logger.info('Creating tables...');
    await session.createTable(
        SERIES_TABLE,
        new TableDescription()
            .withColumn(new Column(
                'series_id',
                Types.optional(Types.UINT64),
            ))
            .withColumn(new Column(
                'title',
                Types.optional(Types.UTF8),
            ))
            .withColumn(new Column(
                'series_info',
                Types.optional(Types.UTF8),
            ))
            .withColumn(new Column(
                'release_date',
                Types.optional(Types.DATE),
            ))
            .withPrimaryKey('series_id')
    );

    await session.createTable(
        SEASONS_TABLE,
        new TableDescription()
            .withColumn(new Column(
                'series_id',
                Types.optional(Types.UINT64),
            ))
            .withColumn(new Column(
                'season_id',
                Types.optional(Types.UINT64),
            ))
            .withColumn(new Column(
                'title',
                Types.optional(Types.UTF8),
            ))
            .withColumn(new Column(
                'first_aired',
                Types.optional(Types.DATE),
            ))
            .withColumn(new Column(
                'last_aired',
                Types.optional(Types.DATE),
            ))
            .withPrimaryKeys('series_id', 'season_id')
    );

    const episodesIndex = new TableIndex('episodes_index')
        .withIndexColumns('title')
        .withDataColumns('air_date')
        .withGlobalAsync(true)

    await session.createTable(
        EPISODES_TABLE,
        new TableDescription()
            .withColumn(new Column(
                'series_id',
                Types.optional(Types.UINT64),
            ))
            .withColumn(new Column(
                'season_id',
                Types.optional(Types.UINT64),
            ))
            .withColumn(new Column(
                'episode_id',
                Types.optional(Types.UINT64),
            ))
            .withColumn(new Column(
                'title',
                Types.optional(Types.UTF8),
            ))
            .withColumn(new Column(
                'air_date',
                Types.optional(Types.DATE),
            ))
            .withPrimaryKeys('series_id', 'season_id', 'episode_id')
            .withIndex(episodesIndex)
    );
}

async function run(logger: Logger, endpoint: string, database: string) {
    const authService = getCredentialsFromEnv();
    logger.debug('Driver initializing...');
    const driver = new Driver({endpoint, database, authService});
    const timeout = 10000;
    if (!await driver.ready(timeout)) {
        logger.fatal(`Driver has not become ready in ${timeout}ms!`);
        process.exit(1);
    }
    await driver.tableClient.withSession(async (session) => {
        await createTables(session, logger);
    });
    await driver.destroy();
}

main(run);

const app = express();
const port = 22000;

app.set('view engine', 'ejs');
app.set('../views', path.join(__dirname, 'views'));

app.use(express.static('public'));

app.get('/', (req, res) => {
  const messagesArray = ['Alex', 'Greg', 'John'];
  res.render('index', { messages: messagesArray });
});

const networkInterfaces = os.networkInterfaces();
const wifiInterface = Object.values(networkInterfaces).find((interfaceList) =>
  interfaceList.find((info) => info.family === 'IPv4' && !info.internal && info.address.includes('.0.'))
);

const localIP = wifiInterface ? wifiInterface.find((info) => info.family === 'IPv4').address : 'Unknown';

app.listen(port, '0.0.0.0', () => {
  console.log(`Express is listening at http://0.0.0.0:${port}`);
  console.log(`Available at http://${localIP}:${port}`);
});
