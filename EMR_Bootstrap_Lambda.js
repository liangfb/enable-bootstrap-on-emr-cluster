const AWS = require('aws-sdk');

exports.handler = async(event, context) => {
    
    /* The shell command that you want to run on emr nodes.
    Sample:
    let command = 'wget https://s3.us-west-2.amazonaws.com/amazoncloudwatch-agent-us-west-2/amazon_linux/amd64/latest/amazon-cloudwatch-agent.rpm && sudo rpm -U ./amazon-cloudwatch-agent.rpm';  
    or config the commands by Lambda environment variable.
    */
    let command = process.env.command;
    
    let outputCWLogGroup = 'RunCommandLog';
    
    AWS.config.update({region: event.region});
    let message = event.detail.message.toString();
    if(message.indexOf('is complete') > 0){

        var idList = await getInstanceIdList(event);
        if(idList != undefined && idList.length > 0)
            await runCommand(idList, command, outputCWLogGroup);
    }

};

function getInstanceIdList(event){
    let clusterId = event.detail.clusterId;
    let groupId = event.detail.instanceGroupId;
    let emr = new AWS.EMR();
    var idList = [];
    var emrparas = {
            ClusterId: clusterId,
            InstanceGroupId: groupId,
            InstanceStates:[
                'RUNNING'
            ]
        };
    return new Promise((resolve, reject) => {
        emr.listInstances(emrparas, (err, data)=>{
            if(err)
                reject(err);
            idList = data.Instances.map(item => item.Ec2InstanceId);
            console.log(idList);
            resolve(idList);
    })
    })
}

function runCommand(instanceIds, command, cwloggroup){
    let ssm = new AWS.SSM();
        var ssmparas = {
            DocumentName: 'AWS-RunShellScript',
            Comment: 'EMR Node Bootstrap',
            CloudWatchOutputConfig: {
                CloudWatchLogGroupName: cwloggroup,
                CloudWatchOutputEnabled: true
            },
            InstanceIds: instanceIds,
            Parameters: {
                'commands': [
                command
                ]
            }
        };

    
    return new Promise((resolve, reject) =>{
        ssm.sendCommand(ssmparas,(err, data) => {
            if(err) console.log(err);
            else console.log(data);
        })
    })
}