import * as aws from "@pulumi/aws";

// S3 tag values only allow letters, numbers, spaces, and + - = . _ : / @
// (see https://docs.aws.amazon.com/AmazonS3/latest/userguide/tagging-managing-buckets.html)
// The "Purpose" tag below contains parentheses, which are not in that set.
const bucket = new aws.s3.Bucket("repro-bucket", {
    tags: {
        Name: "repro-bucket",
        Purpose: "Example bucket (for demo)",
    },
});

export const bucketName = bucket.bucket;
