const AWS = require('aws-sdk');
const request = require('request');
const cheerio = require('cheerio');

const profile = process.env.PROFILE;
const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
const Bucket = process.env.BUCKET;
const region = process.env.REGION;

if (profile) {
  AWS.config.credentials = new AWS.SharedIniFileCredentials({ profile });
} else if (accessKeyId && secretAccessKey) {
  AWS.config.credentials = new AWS.SharedIniFileCredentials({ accessKeyId, secretAccessKey });
}

const S3 = new AWS.S3({ region });

/**
 * GET and cheerio.
 * @param {string} uri - URL
 * @return {object} from cheerio.load
 */
const get = uri => new Promise((resolve, reject) => {
  request({
    uri,
    method: 'GET',
  }, (error, response, body) => {
    if (error) {
      reject(error);
    }
    try {
      resolve(cheerio.load(body));
    } catch (e) {
      reject(e);
    }
  });
});

const replaceForSSML = text => text
  .replace('JavaServer PagesTM', 'JavaServer Pages')
  .replace('Java 3DTM', 'Java 3D')
  .replace('JavaBeanTM', 'JavaBean')
  .replace('JavaBeansTM', 'JavaBeans')
  .replace('JavaCardTM', 'JavaCard')
  .replace('JavadocTM', 'Javadoc')
  .replace('JavaHelpTM', 'JavaHelp')
  .replace('JavaMailTM', 'JavaMail')
  .replace('JavaServerTM', 'JavaServer')
  .replace('JiniTM', 'Jini')
  .replace('JDBCTM', 'JDBC')
  .replace('JavaTM', 'Java')
  .replace('JMXTM', 'JMX')
  .replace('JSPTM', 'JSP')
  .replace('JAINTM', 'JAIN')
  .replace('J2EETM', 'J2EE')
  .replace('J2SETM', 'J2SE')
  .replace('J2METM', 'J2ME')
  .replace('EJBTM', 'EJB')
  .replace(' & ', ' and ');

exports.handler = async () => {
  // main

  const $ = await get('https://www.jcp.org/en/jsr/all');
  const tables = $('.listBy_table');
  // console.log(tables);

  // MEMO: JS on browser.
  // Array.from(document.querySelectorAll('.listBy_table'))
  //   .map((table) => {
  //     return {
  //       no:    table.querySelector('tr:nth-child(1) td.listBy_tableTitle:nth-child(1)').textContent,
  //       title: table.querySelector('tr:nth-child(1) td.listBy_tableTitle:nth-child(3)').textContent,
  //       desc:  table.querySelector('tr:nth-child(2) td:nth-child(3)').textContent,
  //     }
  //   });

  const jsrJsons = Array.from(tables).map((table) => {
    // GET
    const $table = $(table);

    // To text.
    const title = $table.find('tr:nth-child(1) td.listBy_tableTitle:nth-child(3)').text();
    const desc = $table.find('tr:nth-child(2) td:nth-child(3)').text();

    // To object.
    return {
      no: $table.find('tr:nth-child(1) td.listBy_tableTitle:nth-child(1)').text(),
      title: replaceForSSML(title),
      desc: replaceForSSML(desc),
    };
  });

  // Put to S3.
  await Promise.all(
    jsrJsons.map(jsr => S3.putObject({
      Bucket,
      Key: `${jsr.no}.json`,
      Body: JSON.stringify(jsr),
      ContentType: 'application/json',
    }).promise()),
  );
};
