aws cloudformation describe-stacks \
  --stack-name $1 \
  --query "Stacks[0].Outputs[?OutputKey=='EC2InstancePublicIp'].OutputValue" \
  --output text