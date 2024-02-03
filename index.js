const express = require('express')
const app = express();
var router = express.Router();

var BoxSDK = require('box-node-sdk');
var sdk = new BoxSDK({
	clientID: 'fc1leqkblzx8kz8bgdh7ev9n9mj0re46',
	clientSecret: 'ZQcxwEfY2PwdGP4M9hqIhjH6uq8eO5ib'
});

var fs = require('fs');

const axios = require("axios");



router.get("/oauth/verify", (req, res, next) => {
  // // console.log(req);

  console.log(req.query);

  // const client = sdk.getAnonymousClient();

  const c = sdk.getAppUserTokens(req.query.boxUserId)
  console.log(c);
  // const client = sdk.getAppAuthClient("user")

  // console.log(client)

  sdk.getTokensAuthorizationCodeGrant(req.query.boxAuthCode, null, function(err, tokenInfo) {

    if (err) {
      // handle error
      console.log(err);
    }

    // console.log(tokenInfo);
  
    // var tokenStore = new TokenStore();
    // tokenStore.write(tokenInfo, function(storeErr) {
  
    //     console.log()
    // });
    // {
    //   accessToken: 'IFFy3vVgXegkeC0RP6dN1EvOfoemxhiw',
    //   refreshToken: 'JfueDnNUguSfkXTjKWyEhsng6617Cpt4Zob6iV4yR1120CAMQPKZZWPBJRFihBN6',
    //   accessTokenTTLMS: 4156000,
    //   acquiredAtMS: 1706706968480
    // }
  
    // var client = sdk.getPersistentClient(  {
    //   accessToken: 'IFFy3vVgXegkeC0RP6dN1EvOfoemxhiw',
    //   refreshToken: 'JfueDnNUguSfkXTjKWyEhsng6617Cpt4Zob6iV4yR1120CAMQPKZZWPBJRFihBN6',
    //   accessTokenTTLMS: 4156000,
    //   acquiredAtMS: 1706706968480
    // });

    var client = sdk.getPersistentClient(tokenInfo);
  
    // console.log(client);
    // console.log(req.query.boxUserId);

    client.users.get(req.query.boxUserId)
      .then(user => {
          /* user -> {
              type: 'user',
              id: '33333',
              name: 'Example User',
              login: 'user@example.com' }
          */
        // console.log(user.login);

        client.files
          .getMetadata(req.query.boxFileId)
          .then((metaData) => {
            console.log('FILE META', metaData)
            client.files
              .getDownloadURL(req.query.boxFileId)
              .then((docURL) => {
    
                  const state = {
                    boxFileId: req.query.boxFileId,
                    boxUserId: req.query.boxUserId,
                    boxFileExtension: req.query.boxFileExtension,
                    docURL: docURL,
                    token: tokenInfo
                  };
    
                  const encodedState = btoa(JSON.stringify(state));
                  const url = 'http://localhost:4200/box-integration?boxIntegration=true';
                  return res.status(304)
                    .redirect(`${url}&username=${user.login}&state=${encodedState}`);
    
                // const instanceUrl = 'https://jbyc4yhg6fhlctxrmyxzxy4ahy0mboff.lambda-url.ap-south-1.on.aws/msb3-api-uat/instanceurl'
                // Make request
                // axios.get(instanceUrl, {
                //   headers: {
                //     'username': user.login
                //   }
                // }).then((apiRes) => {
                //   console.log(apiRes.data)
            
                //   const state = {
                //     username: user.login,
                //     userInstanceDetails: apiRes.data,
                //     boxFileId: req.query.boxFileId,
                //     boxUserId: req.query.boxUserId,
                //     boxFileExtension: req.query.boxFileExtension,
                //     docURL: docURL,
                //     token: tokenInfo
                //   }
                //   const encodedState = btoa(JSON.stringify(state));
                // return res.status(304).redirect(`http://localhost:4200/box-integration?boxIntegration=true&state=${encodedState}`);
                // }).catch((err) => {
                //   console.log(err)
                //   return res.status(304).redirect(`http://localhost:4200/login?boxIntegration=true&error=true`);
                // });
              })
          })
          .catch((error) => {
            console.error('ERROR FILE META', error)
          })






      });
  
    
  });


  // // client.CURRENT_USER_ID

  

});

router.get("/integration/oauth", (req, res, next) => {

  // console.log(req.query);

  const [ encodedBoxState, app_url ] = req.query.state.split('?app_url=');
  const auth_code = req.query.code;
  const decodedState = JSON.parse(atob(encodedBoxState));


  console.log(auth_code, decodedState);

  /**
   * 
  {
    state: '{{state}}?app_url=https://in.msbdocs.com/mysignaturebook',
    code: 'faYfHT'
  }
  */

  const accessTokenData = {
    code: auth_code,
    username: decodedState.username,
    client_id: "MSB APP",
    client_secret: "password",
    grant_type: "authorization_code"
  };
  try {
    const tokenURL = app_url + '/msbapi/public/token';
    axios.post(tokenURL, accessTokenData)
      .then((resp) => {
        
      })

  } catch {

  } finally {

  }
  

});

router.get("/integration/box/upload", (req, res, next) => {

  console.log(req.query);
  const {
    app_url,
    state,
    userTenantId
  } = req.query;
  const {
    boxFileId,
    boxUserId,
    boxFileExtension,
    docURL,
    token
  } = JSON.parse(atob(state));

  const payload = {
    externalSysUserInfo: {
      userExternalSystemId: boxUserId
    },
    externalSystemName: 'OneDrive',
    skyDriveFileInfoList: [{
      skyDriveFileID: boxFileId,
      skyDriveFileName: 'uploadedFromBox',
      skyDriveFileDownloadUri: docURL,
      skyDriveFileParentReference: '/'
    }]
  };


  // /skydrivefiles

  const url = app_url + '/msbapi/v1/skydrivefiles'

  // axios.post(url, { skyDriveData: payload})
  //       .then((resp) => {
  //         console.log('UPLOAD RESPONSE',resp);
  //       })
  //       .catch((error) => {
  //         console.log('UPLOAD ERROR',error);
  //       })



  // console.log(auth_code, decodedState);
  

});

app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  res.header("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE");
  res.header("Access-Control-Allow-Credentials", true);
  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }
  next();
});
app.use("/api", router);

app.listen(3000, () => {
  console.log(`app is ru;nning at 3000`);
});