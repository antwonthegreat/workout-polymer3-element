module.exports = {
  staticFileGlobs: [
    'manifest.json',
    'node_modules/babel-polyfill/dist/polyfill.min.js',
    'src/**/*',
    'images/**.*'
  ],
  navigateFallback: 'index.html',
  navigateFallbackWhitelist: [/^(?!.*\.html$|\/data\/).*/],
  runtimeCaching: [{
    urlPattern: /\/@webcomponents\/webcomponentsjs\//,
    handler: 'fastest'
  },
  {
    urlPattern: /^https:\/\/fonts.gstatic.com\//,
    handler: 'fastest'
  },
  {
    urlPattern: /.*\.(png|jpg|gif|svg)/i,
    handler: 'fastest',
    options: {
      cache: {
        maxEntries: 200,
        name: 'data-images-cache'
      }
    }
  }, {
    urlPattern: /http:\/\/localhost:59465\/*/,
    handler: 'networkFirst'
  }
  ],
  verbose: true

};