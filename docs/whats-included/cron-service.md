# The Cron Service

The cron service is a simple Cron Daemon designed to be run in-browser which supports a resolution of up to 10ms.

## Accessing the Cron Service

The Cron Service is both injectable and accessible from the global `Vue` instance:

```vue

<script lang="ts">
import { defineComponent, inject } from 'vue'
import type { CronService } from '@jakguru/vueprint'
export default defineComponent({
    setup() {
        const cron = inject<CronService>('cron')
        return {}
    }
    mounted() {
        const cron: CronService = this.config.globalProperties.$cron
    }
})
</script>
```

## Using the Cron Service

### Adding a cron job

You can use the `CronService.$on` and `CronService.$once` methods to add a callback which will be called when the appropriate cron expression is matched. For example:

```typescript
cron.$on('* * * * *', () => {
  // this runs once per minute
})

cron.$once("1704067200", () => {
  // This is set to run at midnight on January 1st, 2024
  console.log('Happy New Year!');
});

cron.$once(DateTime.now().toUTC().plus({ seconds: 10 }).toUnixInteger().toString(), () => {
  // This is set to run 10 seconds from now
  console.log("10 seconds later");
});
```

### Supported cron expressions

The cron service accepts an enhanced crontab format:

#### Crontab format

```text
  *    *    *    *    *    *    *
  ┬    ┬    ┬    ┬    ┬    ┬    ┬
  │    │    │    │    │    │    |
  │    │    │    │    │    │    └ day of week (0 - 7, 1L - 7L) (0 or 7 is Sun)
  │    │    │    │    │    └───── month (1 - 12)
  │    │    │    │    └────────── day of month (1 - 31, L)
  │    │    │    └─────────────── hour (0 - 23)
  │    │    └──────────────────── minute (0 - 59)
  |    └───────────────────────── second (0 - 59, optional)
  └────────────────────────────── millisecond (0 - 999, optional)*
 ```

::: tip
While the millisecond field accepts values of 0-999, the resolution of the cron daemon is limited to 10ms, meaning that the job may trigger up to 10ms before or 10ms after the expressions's defined time.
:::

Additionally, the library also accepts mixed use of ranges and range increments (except for `W`).

##### Examples

* `* * * * * * *` - Every 10ms
* `*/2 * * * * * *` - Every 10ms (due to the 10ms resolution)
* `*/100 * * * * *` - Every 100ms
* `0 * * * * * *` - Every second
* `0 0 * * * * *` - Every minute

For more information on the crontab format, see [crontab.guru](https://crontab.guru/) or [cronjob.xyz](https://cronjob.xyz/).
Note that these don't accept the exact same syntax as this library, as they do not accept the millisecond or seconds fields.

#### Crontab aliases

* `@yearly` - Once a year, at midnight on the morning of January 1st
* `@monthly` - Once a month, at midnight on the morning of the first day of the month
* `@weekly` - Once a week, at midnight on Sunday morning
* `@daily` - Once a day, at midnight
* `@hourly` - Once an hour, at the beginning of the hour

#### Unix Timestamp (seconds)

A unix timestamp in seconds can be used to specify a single time to run the job.
**Important Note**: It is highly recommended to use the `$once` method with unix timestamps instead of `$on` in order to clear the callback after the job has run.
