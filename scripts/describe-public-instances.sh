aws ec2 describe-instances \
  --query 'Reservations[*].Instances[*].PublicIpAddress' \
  --filters "Name=tag:$1,Values=$2" \
  --output text
