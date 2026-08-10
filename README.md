# pulumi-aws S3 InvalidTag repro

Minimal repro for a misleading error when `aws.s3.Bucket` receives a tag value
containing a character S3 doesn't allow (e.g. parentheses).

## What happens

```
pulumi up
```

fails with:

```
error: InvalidTag: The TagValue you have provided is invalid: provider=aws@7.40.0
```

The error gives **no indication of which tag or value is invalid**. The
`provider=aws@7.40.0` fragment looks like it could be a rejected tag (it was
mistaken for one during debugging), but it is actually unrelated log/error
context identifying the provider plugin version — it appears on every error
from this provider, including ones that have nothing to do with tags (e.g. an
RDS `InvalidParameterCombination` error in the same session also carried the
same `provider=aws@<version>` suffix).

## Root cause in this repro

`index.ts` sets:

```ts
tags: {
    Purpose: "Example bucket (for demo)",
}
```

S3 tag values only allow letters, numbers, spaces, and `+ - = . _ : / @`
([AWS docs](https://docs.aws.amazon.com/AmazonS3/latest/userguide/tagging-managing-buckets.html)).
Parentheses are not in that set, so `CreateBucket` rejects the whole tag set —
but the error message never says which key/value caused it.

## Ask

Please have `CreateBucket`'s `InvalidTag` error (or the bridge's handling of
it) surface the specific tag key and/or value that failed validation, similar
to how some other AWS SDK errors include the offending field name.

## Reproduce

```
npm install
pulumi stack init dev
pulumi config set aws:region eu-west-1
pulumi up
```

## `pulumi about`

```
CLI          
Version      3.242.0
Go Version   go1.26.3
Go Compiler  gc

Plugins
KIND      NAME    VERSION
resource  aws     7.40.0
language  nodejs  3.242.0

Host     
OS       darwin
Version  26.5.2
Arch     arm64

Dependencies:
NAME            VERSION
@pulumi/aws     7.40.0
@pulumi/pulumi  3.256.0
@types/node     20.19.43
```
