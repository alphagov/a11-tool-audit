let nunjucks = require('nunjucks'),
    fs = require('fs'),
    path = require('path'),
    analysis = require('./analysis');

let paths = {
  testsJson: path.join(__dirname, '../tests.json'),
  analysisJson: path.join(__dirname, '../analysis.json'),
  changelogJson: path.join(__dirname, '../changelog.json'),
  templates: path.join(__dirname, 'templates'),
  outPath: path.join(__dirname, '../'),
  out: fname => path.join(paths.outPath, fname)
};

let resultsCopy = {
  "error": "issue found",
  "error_paid": "issue found (paid)",
  "warning": "warning only",
  "notfound": "not found",
  "identified": "noticed but not a fail",
  "manual": "user to check"
};

let toolNamesCopy = {
  "tenon": "Tenon",
  "achecker": "AChecker",
  "axe": "aXe",
  "asqatasun": "Asqatasun",
  "sortsite": "SortSite",
  "wave": "WAVE",
  "codesniffer": "HTML_CodeSniffer",
  "google": "Google ADT",
  "eiii": '<abbr title="European Internet Inclusion Initiative">EIII</abbr>',
  "nu": "Nu Html Checker",
  "siteimprove": "Siteimprove",
  "fae": '<abbr title="Functional Accessibility Evaluator">FAE</abbr>',
  "aslint": "ASLint"
}

let tools = {
  "tenon": {
    name: toolNamesCopy["tenon"],
    url: "https://tenon.io/"
  },
  "achecker": {
    name: toolNamesCopy["achecker"],
    url: "http://achecker.ca/"
  },
  "axe": {
    name: toolNamesCopy["axe"],
    url: "https://www.axe-core.org/"
  },
  "asqatasun": {
    name: toolNamesCopy["asqatasun"],
    url: "http://asqatasun.org/"
  },
  "sortsite": {
    name: toolNamesCopy["sortsite"],
    url: "https://www.powermapper.com/products/sortsite/"
  },
  "wave": {
    name: toolNamesCopy["wave"],
    url: "http://wave.webaim.org/extension/"
  },
  "codesniffer": {
    name: toolNamesCopy["codesniffer"],
    url: "https://squizlabs.github.io/HTML_CodeSniffer/"
  },
  "google": {
    name: toolNamesCopy["google"],
    url: "https://github.com/GoogleChrome/accessibility-developer-tools"
  },
  "eiii": {
    name: toolNamesCopy["eiii"],
    url: "http://checkers.eiii.eu/"
  },
  "nu": {
    name: toolNamesCopy["nu"],
    url: "https://validator.w3.org/nu/"
  },
  "siteimprove": {
    name: toolNamesCopy["siteimprove"],
    url: "https://siteimprove.com/"
  },
  "fae": {
    name: toolNamesCopy["fae"],
    url: "https://fae.disability.illinois.edu/"
  },
  "aslint": {
    name: toolNamesCopy["aslint"],
    url: "https://www.aslint.org/"
  }
}

function getFilename( catname, testname ){
    let filename = [catname.toLowerCase(), testname.toLowerCase()]
                      .join('-')
                      .replace(/[^a-z0-9\-\ ]/, '')
                      .replace('/', ' ')
                      .replace(':', '-')
                      .replace(/\s+/g, '-')
                      .replace(/-+/g, '-');

    return filename;
}

function processExample( example ){
  if( example.indexOf('images') > -1 ){
    example = example.replace('images/', '../assets/test_images/');
  }

  if( example.indexOf('example-pages') > -1 ){
    example = example.replace('example-pages/', '../example-pages/');
  }

  return example;
}

function generateFiles(){
  let testsFile = fs.readFileSync(paths.testsJson).toString();
  let tests = JSON.parse(testsFile);

  analysis.analyse();
  let analysisResults = require(paths.analysisJson);

  let changelog = fs.readFileSync(paths.changelogJson).toString();
  let changes = JSON.parse(changelog);

  nunjucks.configure(paths.templates);

  // Generate index
  let indexout = nunjucks.render('index.html', {
    tests: tests,
    getFilename: getFilename,
    analysis: analysisResults,
    tools: tools,
    changes: changes
  });
  fs.writeFileSync(paths.out('index.html'), indexout, 'utf8');

  // Generate test cases

  let indexout = nunjucks.render('test-cases.html', {
    tests: tests,
    getFilename: getFilename
  });
  fs.writeFileSync(paths.out('test-cases.html'), indexout, 'utf8');

  // Generate individual tests

  for( let catname in tests ){
    for( let testname in tests[catname] ){
      let testObj = tests[catname][testname];

      let filename = getFilename( catname, testname );

      let filecontent = nunjucks.render('single-test.html', {
        testname: testname,
        example: processExample(testObj.example)
      });

      fs.writeFileSync(paths.out('tests/' + filename + ".html"), filecontent, 'utf8');
    }
  }

  // Generate results
  let resultsout = nunjucks.render('results.html', {
    tests: tests,
    rcopy: resultsCopy,
    getFilename: getFilename,
    analysis: analysisResults,
    resultTypes: analysis.resultTypes,
    toolNames: analysis.toolNames,
    changes: changes
  });
  fs.writeFileSync(paths.out('results.html'), resultsout, 'utf8');
}

module.exports = {
  generate: generateFiles
}
