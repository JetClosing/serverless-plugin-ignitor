![npm downloads total](https://img.shields.io/npm/dt/serverless-plugin-ignitor.svg) ![npm version](https://img.shields.io/npm/v/serverless-plugin-ignitor.svg) ![npm license](https://img.shields.io/npm/l/serverless-plugin-ignitor.svg)
[![Build Status](https://travis-ci.com/JetClosing/serverless-plugin-ignitor.svg?branch=master)](https://travis-ci.com/JetClosing/serverless-plugin-ignitor)

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

The plugin provides the following configurations per matching keys.

| Option | Values | Default | Description  |
| :--- | :--- | :--- | :--- |
| `schedule` | Boolean or Object | null | Controls whether the lambda should be schedule |
| `wrapper` | String | null | The file path where a custom wrapper exists (same as a function handler definition) |

#### Options Example

```yaml
custom: 
  ignitor:
    hello:
      wrapper: wrappers.logger
      schedule:
        rate: rate(3 minutes)
        enabled: true
        input: 
          source: 'logger'

    # regular expressions can be used
    /good.*/: 
      schedule: false 
      
    /non-matching/:
      schedule: true

functions:
  hello:
    handler: handlers.hello
    timeout: 10
  goodbye:
    handler: handlers.goodbye

plugins:
  - serverless-plugin-ignitor
  - serverless-webpack
```

#### Custom Schedule
If you want to build a custom schedule instead of the default ignitor schedule, it requires an `input` property. This is because the `input` will be used as an event during post-deployment invocation. 

#### Custom Wrapper
If you want to build a custom wrapper instead of the default ignitor wrapper, it needs to be written like a higher-order-function. 

Example:
```
// wrappers.js
const logger = (original) => (evt, ctx, cb) => {
  console.log('Logging event data:', JSON.stringify(evt, null, 2));
  return original(evt, ctx, cb);
}

module.exports = {
  logger,
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
