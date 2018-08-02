# scrape-jsr

Web scraping for JSR (Java Specification Request) JSON.

GET https://www.jcp.org/en/jsr/all and put JSON.

## Environment

* REGION: Target region for S3 bucket.
* BUCKET: Target bucket for JSR jsons.

Optional (profile)

* PROFILE

Optional (Access key)

* AWS_ACCESS_KEY_ID
* AWS_SECRET_ACCESS_KEY

## You will get json in your S3 bucket

```json
{"no":"1","title":"Real-time Specification for Java","desc":"The Real-Time Specification for Java extends the Java platform to support both current practice and advanced real-time systems application programming."}
```

## Execution

For your local computer

```
node handle.js
```

For your lambda function.

```
npm run make
aws s3 cp ./build/Release/scrape-jsr.zip s3://[YOUR_S3_BUCKET]/
aws lambda update-function-code --function-name [YOUR_LAMBDA_FUNCTION_NAME] --s3-bucket [YOUR_S3_BUCKET] --s3-key scrape-jsr.zip --publish
```
