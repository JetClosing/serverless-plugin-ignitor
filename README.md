## Installation

```sh
npm install serverless-plugin-ignitor --save-dev
```
or
```sh
yarn add serverless-plugin-ignitor --dev
```

## Usage

In the serverless file, add your configuration in a custom variable named ignitor. Also include `serverless-plugin-ignitor` within the plugins.

Example:

```yaml
custom: 
  ignitor:
    functions:
      - hello # function key name

functions:
  hello:
    handler: src/hello.handler
    timeout: 15

plugins:
  - serverless-plugin-ignitor
```

All functions defined in the functions list will then be automatically scheduled, automatically wrapped to accept scheduled events, and immediately invoked post-deployment.  

## Options

The plugin provides the following configurations.

| Option | Values | Default | Description  |
| :--- | :--- | :--- | :--- |
| `schedule` | Boolean | true | Control whether the lambda should be ignited every 5 minutes |
| `functions` | mixed[], String or RegExp | [] | Which functions to perform wrapping, and immediate calls to post-deployment |

#### Options Example

```yaml
custom: 
  ignitor:
    schedule: false # do not schedule events
    functions:
      - /hello/ # wrap code and call once deployed

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


Total monthly cost per-lambda: `$0.01613088`

_**Prices calculated using the following aws information  [here](https://aws.amazon.com/lambda/pricing/)._


