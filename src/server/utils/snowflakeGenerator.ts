import { Snowflake } from 'nodejs-snowflake';

export const snowflakeGenerator = new Snowflake({
	custom_epoch: 1640991600000,
	instance_id: 1
});
