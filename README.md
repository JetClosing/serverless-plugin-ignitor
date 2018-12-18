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

The plugin provides the following configurations.

| Option | Values | Default | Description  |
| :--- | :--- | :--- | :--- |
| `schedule` | Boolean | true | Control whether the lambda should be ignited every 5 minutes |
| `functions` | mixed[], String or RegExp | ['/.*/'] | Which functions to perform wrapping, and immediate calls to post-deployment |

#### Options Example

```yaml
custom: 
  ignitor:
    schedule: false # do not schedule events
    functions:
      - /hello/ # only wrap functions listed

functions:
  hello:
    handler: src/hello.handler
    timeout: 15

plugins:
  - serverless-plugin-ignitor
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
