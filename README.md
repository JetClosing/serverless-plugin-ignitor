## Installation

```sh
npm install serverless-plugin-ignitor --save-dev
```
or
```sh
yarn add serverless-plugin-ignitor --dev
```

## Usage

In the serverless file, add `serverless-plugin-ignitor` within the plugins entry.

Example:

```yaml
functions:
  hello:
    handler: src/hello.handler
    timeout: 15

plugins:
  - serverless-plugin-ignitor
```

By default all functions will then be automatically scheduled, wrapped to accept scheduled events, and immediately invoked post-deployment. If you want more granular control, options can be configured within a custom ignitor variable.

## Options

The plugin provides the following on a **per-function** configurations.

| Option | Values | Default | Description  |
| :--- | :--- | :--- | :--- |
| `schedule` | Boolean | true | Control whether the lambda should be ignited every 5 minutes |
| `name` | String or RegExp | '.*' | Which function name to perform wrapping, and immediate calls to during post-deployment |
| `wrapper` | String | null | An override for the wrapper function, please include the extname |
| `event` | Object | `{ "ignitor": true }` | The event that is used during scheduled events, and post deployment |

#### Options Example 
```yaml
custom: 
  ignitor:
    functions:
      - name: /HI/i
        schedule: false
      - name: bye
        schedule: true
        wrapper: ./deprecated.js
        event: 
          french: 'Au revoir'

functions:
  hi:
    handler: src/handler.hello
    timeout: 15
    
  bye:
    handler: src/handler.goodbye

plugins:
  - serverless-plugin-ignitor
```

## Custom Wrappers
When writing a custom wrapper, please remember to keep it lightweight, and follow the naming convention of `wrapper` for your function. The override will be read directly as utf8 and the original handler and exporting of your wrapper will be done for you, making it quick and painless to write.

Example:
```
const wrapper = (original) => (event, context, callback) => {
    callback('This lambda has been deprecated');
};
```

## Plugin Conflicts

Make sure `serverless-plugin-ignitor` is placed before any plugins that compile code. 
Example:

```yaml
plugins:
  - serverless-plugin-ignitor
  - serverless-webpack
```

## Cost

Cost per execution: `$0.0000002`

Cost per memory allocated 1024MB: `$0.000001667`

Calls per day: `288`

Calls per month: `8640`


Total monthly cost per-lambda: `$0.016`

_**Prices calculated using the following aws information  [here](https://aws.amazon.com/lambda/pricing/)._
