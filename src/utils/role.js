
const DELEGATE_ROLE_NAME = 'IgnitorDelegateLambdaFunctionRole';

const attachRoleToLambda = (lambda) => {
  // eslint-disable-next-line no-param-reassign
  lambda.role = {
    'Fn::GetAtt': [
      DELEGATE_ROLE_NAME,
      'Arn',
    ],
  };
};

const createLambdaRole = (resources, { stage, service }) => {
  // eslint-disable-next-line no-param-reassign
  resources[DELEGATE_ROLE_NAME] = {
    Type: 'AWS::IAM::Role',
    Properties: {
      AssumeRolePolicyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Effect: 'Allow',
            Principal: {
              Service: [
                'lambda.amazonaws.com',
              ],
            },
            Action: 'sts:AssumeRole',
          },
        ],
      },
      Policies: [
        {
          PolicyName: 'logging',
          PolicyDocument: {
            Version: '2012-10-17',
            Statement: [
              {
                Effect: 'Allow',
                Action: [
                  'logs:CreateLogStream',
                ],
                Resource: [
                  {
                    'Fn::Join': [
                      ':',
                      [
                        'arn:aws:logs',
                        {
                          Ref: 'AWS::Region',
                        },
                        {
                          Ref: 'AWS::AccountId',
                        },
                        `log-group:/aws/lambda/${service}-${stage}-ignitorDelegate:*`,
                      ],
                    ],
                  },
                ],
              },
              {
                Effect: 'Allow',
                Action: [
                  'logs:PutLogEvents',
                ],
                Resource: [
                  {
                    'Fn::Join': [
                      ':',
                      [
                        'arn:aws:logs',
                        {
                          Ref: 'AWS::Region',
                        },
                        {
                          Ref: 'AWS::AccountId',
                        },
                        `log-group:/aws/lambda/${service}-${stage}-ignitorDelegate:*:*`,
                      ],
                    ],
                  },
                ],
              },
            ],
          },
        },
        {
          PolicyName: 'custom',
          PolicyDocument: {
            Version: '2012-10-17',
            Statement: [
              {
                Effect: 'Allow',
                Action: [
                  'lambda:InvokeFunction',
                ],
                Resource: '*',
              },
            ],
          },
        },
      ],
    },
  };
};

module.exports = {
  attachRoleToLambda,
  createLambdaRole,
};
