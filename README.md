# Enable bootstrap on an exist Amazon EMR cluster

1. Enable System Manager Run Command  
    Attach IAM policy(AmazonEC2RoleforSSM) to EMR EC2 Instance Profile.
2. Deploy Lambda function.  
3. Config environment variables.  
   Add an environment variable for the Lambda Function, key: "command", value: the shell command or script to execute.
2. Deploy Lambda function
3. Config environment variables
4. Config CloudWatch Event to emit EMR events  
    **Event Pattern:**   
    Service Name: EMR  
      Event Type: State Change  
      Specific detail types: EMR Instance Group State Change  
      Specific states: RESIZING  
    **Targets:**  
      Lambda Function: Lambda in step 2  
      Lambda Function: Lambda deoloyed in step 2  
