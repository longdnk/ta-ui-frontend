const { merge } = require('webpack-merge');
const baseWebpackConfig = require('./webpack.base.conf');
const webpack = require('webpack');

const buildWebpackConfig = merge(baseWebpackConfig, {
    //!!!
    //CAUTION Production config
    //!!!
    mode: 'production',
    plugins: [
        new webpack.DefinePlugin({
            'process.env': {
                REACT_APP_API_URL: JSON.stringify(process.env.REACT_APP_API_URL),
                NODE_ENV: JSON.stringify(process.env.NODE_ENV),
                WDS_SOCKET_PATH: JSON.stringify(process.env.WDS_SOCKET_PATH),
            },
        }),
    ],
});

module.exports = new Promise((resolve, reject) => {
    resolve(buildWebpackConfig);
});