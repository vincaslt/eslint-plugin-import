'use strict';

var _ExportMap = require('../ExportMap');

var _ExportMap2 = _interopRequireDefault(_ExportMap);

var _resolve = require('eslint-module-utils/resolve');

var _resolve2 = _interopRequireDefault(_resolve);

var _docsUrl = require('../docsUrl');

var _docsUrl2 = _interopRequireDefault(_docsUrl);

var _path = require('path');

var _readPkgUp = require('read-pkg-up');

var _readPkgUp2 = _interopRequireDefault(_readPkgUp);

var _object = require('object.values');

var _object2 = _interopRequireDefault(_object);

var _arrayIncludes = require('array-includes');

var _arrayIncludes2 = _interopRequireDefault(_arrayIncludes);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } } /**
                                                                                                                                                                                                 * @fileOverview Ensures that modules contain exports and/or all
                                                                                                                                                                                                 * modules are consumed within other modules.
                                                                                                                                                                                                 * @author René Fermann
                                                                                                                                                                                                 */

// eslint/lib/util/glob-util has been moved to eslint/lib/util/glob-utils with version 5.3
// and has been moved to eslint/lib/cli-engine/file-enumerator in version 6
let listFilesToProcess;
try {
  var FileEnumerator = require('eslint/lib/cli-engine/file-enumerator').FileEnumerator;
  listFilesToProcess = function (src) {
    var e = new FileEnumerator();
    return Array.from(e.iterateFiles(src), (_ref) => {
      let filePath = _ref.filePath,
          ignored = _ref.ignored;
      return {
        ignored,
        filename: filePath
      };
    });
  };
} catch (e1) {
  try {
    listFilesToProcess = require('eslint/lib/util/glob-utils').listFilesToProcess;
  } catch (e2) {
    listFilesToProcess = require('eslint/lib/util/glob-util').listFilesToProcess;
  }
}

const EXPORT_DEFAULT_DECLARATION = 'ExportDefaultDeclaration';
const EXPORT_NAMED_DECLARATION = 'ExportNamedDeclaration';
const EXPORT_ALL_DECLARATION = 'ExportAllDeclaration';
const IMPORT_DECLARATION = 'ImportDeclaration';
const IMPORT_NAMESPACE_SPECIFIER = 'ImportNamespaceSpecifier';
const IMPORT_DEFAULT_SPECIFIER = 'ImportDefaultSpecifier';
const VARIABLE_DECLARATION = 'VariableDeclaration';
const FUNCTION_DECLARATION = 'FunctionDeclaration';
const CLASS_DECLARATION = 'ClassDeclaration';
const DEFAULT = 'default';

let preparationDone = false;
const importList = new Map();
const exportList = new Map();
const ignoredFiles = new Set();
const filesOutsideSrc = new Set();

const isNodeModule = path => {
  return (/\/(node_modules)\//.test(path)
  );
};

/**
 * read all files matching the patterns in src and ignoreExports
 *
 * return all files matching src pattern, which are not matching the ignoreExports pattern
 */
const resolveFiles = (src, ignoreExports) => {
  const srcFiles = new Set();
  const srcFileList = listFilesToProcess(src);

  // prepare list of ignored files
  const ignoredFilesList = listFilesToProcess(ignoreExports);
  ignoredFilesList.forEach((_ref2) => {
    let filename = _ref2.filename;
    return ignoredFiles.add(filename);
  });

  // prepare list of source files, don't consider files from node_modules
  srcFileList.filter((_ref3) => {
    let filename = _ref3.filename;
    return !isNodeModule(filename);
  }).forEach((_ref4) => {
    let filename = _ref4.filename;

    srcFiles.add(filename);
  });
  return srcFiles;
};

/**
 * parse all source files and build up 2 maps containing the existing imports and exports
 */
const prepareImportsAndExports = (srcFiles, context) => {
  const exportAll = new Map();
  srcFiles.forEach(file => {
    const exports = new Map();
    const imports = new Map();
    const currentExports = _ExportMap2.default.get(file, context);
    if (currentExports) {
      const dependencies = currentExports.dependencies,
            reexports = currentExports.reexports,
            localImportList = currentExports.imports,
            namespace = currentExports.namespace;

      // dependencies === export * from

      const currentExportAll = new Set();
      dependencies.forEach(value => {
        currentExportAll.add(value().path);
      });
      exportAll.set(file, currentExportAll);

      reexports.forEach((value, key) => {
        if (key === DEFAULT) {
          exports.set(IMPORT_DEFAULT_SPECIFIER, { whereUsed: new Set() });
        } else {
          exports.set(key, { whereUsed: new Set() });
        }
        const reexport = value.getImport();
        if (!reexport) {
          return;
        }
        let localImport = imports.get(reexport.path);
        let currentValue;
        if (value.local === DEFAULT) {
          currentValue = IMPORT_DEFAULT_SPECIFIER;
        } else {
          currentValue = value.local;
        }
        if (typeof localImport !== 'undefined') {
          localImport = new Set([].concat(_toConsumableArray(localImport), [currentValue]));
        } else {
          localImport = new Set([currentValue]);
        }
        imports.set(reexport.path, localImport);
      });

      localImportList.forEach((value, key) => {
        if (isNodeModule(key)) {
          return;
        }
        imports.set(key, value.importedSpecifiers);
      });
      importList.set(file, imports);

      // build up export list only, if file is not ignored
      if (ignoredFiles.has(file)) {
        return;
      }
      namespace.forEach((value, key) => {
        if (key === DEFAULT) {
          exports.set(IMPORT_DEFAULT_SPECIFIER, { whereUsed: new Set() });
        } else {
          exports.set(key, { whereUsed: new Set() });
        }
      });
    }
    exports.set(EXPORT_ALL_DECLARATION, { whereUsed: new Set() });
    exports.set(IMPORT_NAMESPACE_SPECIFIER, { whereUsed: new Set() });
    exportList.set(file, exports);
  });
  exportAll.forEach((value, key) => {
    value.forEach(val => {
      const currentExports = exportList.get(val);
      const currentExport = currentExports.get(EXPORT_ALL_DECLARATION);
      currentExport.whereUsed.add(key);
    });
  });
};

/**
 * traverse through all imports and add the respective path to the whereUsed-list
 * of the corresponding export
 */
const determineUsage = () => {
  importList.forEach((listValue, listKey) => {
    listValue.forEach((value, key) => {
      const exports = exportList.get(key);
      if (typeof exports !== 'undefined') {
        value.forEach(currentImport => {
          let specifier;
          if (currentImport === IMPORT_NAMESPACE_SPECIFIER) {
            specifier = IMPORT_NAMESPACE_SPECIFIER;
          } else if (currentImport === IMPORT_DEFAULT_SPECIFIER) {
            specifier = IMPORT_DEFAULT_SPECIFIER;
          } else {
            specifier = currentImport;
          }
          if (typeof specifier !== 'undefined') {
            const exportStatement = exports.get(specifier);
            if (typeof exportStatement !== 'undefined') {
              const whereUsed = exportStatement.whereUsed;

              whereUsed.add(listKey);
              exports.set(specifier, { whereUsed });
            }
          }
        });
      }
    });
  });
};

const getSrc = src => {
  if (src) {
    return src;
  }
  return [process.cwd()];
};

/**
 * prepare the lists of existing imports and exports - should only be executed once at
 * the start of a new eslint run
 */
let srcFiles;
const doPreparation = (src, ignoreExports, context) => {
  srcFiles = resolveFiles(getSrc(src), ignoreExports);
  prepareImportsAndExports(srcFiles, context);
  determineUsage();
  preparationDone = true;
};

const newNamespaceImportExists = specifiers => specifiers.some((_ref5) => {
  let type = _ref5.type;
  return type === IMPORT_NAMESPACE_SPECIFIER;
});

const newDefaultImportExists = specifiers => specifiers.some((_ref6) => {
  let type = _ref6.type;
  return type === IMPORT_DEFAULT_SPECIFIER;
});

const fileIsInPkg = file => {
  var _readPkgUp$sync = _readPkgUp2.default.sync({ cwd: file, normalize: false });

  const path = _readPkgUp$sync.path,
        pkg = _readPkgUp$sync.pkg;

  const basePath = (0, _path.dirname)(path);

  const checkPkgFieldString = pkgField => {
    if ((0, _path.join)(basePath, pkgField) === file) {
      return true;
    }
  };

  const checkPkgFieldObject = pkgField => {
    const pkgFieldFiles = (0, _object2.default)(pkgField).map(value => (0, _path.join)(basePath, value));
    if ((0, _arrayIncludes2.default)(pkgFieldFiles, file)) {
      return true;
    }
  };

  const checkPkgField = pkgField => {
    if (typeof pkgField === 'string') {
      return checkPkgFieldString(pkgField);
    }

    if (typeof pkgField === 'object') {
      return checkPkgFieldObject(pkgField);
    }
  };

  if (pkg.private === true) {
    return false;
  }

  if (pkg.bin) {
    if (checkPkgField(pkg.bin)) {
      return true;
    }
  }

  if (pkg.browser) {
    if (checkPkgField(pkg.browser)) {
      return true;
    }
  }

  if (pkg.main) {
    if (checkPkgFieldString(pkg.main)) {
      return true;
    }
  }

  return false;
};

module.exports = {
  meta: {
    docs: { url: (0, _docsUrl2.default)('no-unused-modules') },
    schema: [{
      properties: {
        src: {
          description: 'files/paths to be analyzed (only for unused exports)',
          type: 'array',
          minItems: 1,
          items: {
            type: 'string',
            minLength: 1
          }
        },
        ignoreExports: {
          description: 'files/paths for which unused exports will not be reported (e.g module entry points)',
          type: 'array',
          minItems: 1,
          items: {
            type: 'string',
            minLength: 1
          }
        },
        missingExports: {
          description: 'report modules without any exports',
          type: 'boolean'
        },
        unusedExports: {
          description: 'report exports without any usage',
          type: 'boolean'
        }
      },
      not: {
        properties: {
          unusedExports: { enum: [false] },
          missingExports: { enum: [false] }
        }
      },
      anyOf: [{
        not: {
          properties: {
            unusedExports: { enum: [true] }
          }
        },
        required: ['missingExports']
      }, {
        not: {
          properties: {
            missingExports: { enum: [true] }
          }
        },
        required: ['unusedExports']
      }, {
        properties: {
          unusedExports: { enum: [true] }
        },
        required: ['unusedExports']
      }, {
        properties: {
          missingExports: { enum: [true] }
        },
        required: ['missingExports']
      }]
    }]
  },

  create: context => {
    var _ref7 = context.options[0] || {};

    const src = _ref7.src;
    var _ref7$ignoreExports = _ref7.ignoreExports;
    const ignoreExports = _ref7$ignoreExports === undefined ? [] : _ref7$ignoreExports,
          missingExports = _ref7.missingExports,
          unusedExports = _ref7.unusedExports;


    if (unusedExports && !preparationDone) {
      doPreparation(src, ignoreExports, context);
    }

    const file = context.getFilename();

    const checkExportPresence = node => {
      if (!missingExports) {
        return;
      }

      if (ignoredFiles.has(file)) {
        return;
      }

      const exportCount = exportList.get(file);
      const exportAll = exportCount.get(EXPORT_ALL_DECLARATION);
      const namespaceImports = exportCount.get(IMPORT_NAMESPACE_SPECIFIER);

      exportCount.delete(EXPORT_ALL_DECLARATION);
      exportCount.delete(IMPORT_NAMESPACE_SPECIFIER);
      if (missingExports && exportCount.size < 1) {
        // node.body[0] === 'undefined' only happens, if everything is commented out in the file
        // being linted
        context.report(node.body[0] ? node.body[0] : node, 'No exports found');
      }
      exportCount.set(EXPORT_ALL_DECLARATION, exportAll);
      exportCount.set(IMPORT_NAMESPACE_SPECIFIER, namespaceImports);
    };

    const checkUsage = (node, exportedValue) => {
      if (!unusedExports) {
        return;
      }

      if (ignoredFiles.has(file)) {
        return;
      }

      if (fileIsInPkg(file)) {
        return;
      }

      if (filesOutsideSrc.has(file)) {
        return;
      }

      // make sure file to be linted is included in source files
      if (!srcFiles.has(file)) {
        srcFiles = resolveFiles(getSrc(src), ignoreExports);
        if (!srcFiles.has(file)) {
          filesOutsideSrc.add(file);
          return;
        }
      }

      exports = exportList.get(file);

      // special case: export * from
      const exportAll = exports.get(EXPORT_ALL_DECLARATION);
      if (typeof exportAll !== 'undefined' && exportedValue !== IMPORT_DEFAULT_SPECIFIER) {
        if (exportAll.whereUsed.size > 0) {
          return;
        }
      }

      // special case: namespace import
      const namespaceImports = exports.get(IMPORT_NAMESPACE_SPECIFIER);
      if (typeof namespaceImports !== 'undefined') {
        if (namespaceImports.whereUsed.size > 0) {
          return;
        }
      }

      const exportStatement = exports.get(exportedValue);

      const value = exportedValue === IMPORT_DEFAULT_SPECIFIER ? DEFAULT : exportedValue;

      if (typeof exportStatement !== 'undefined') {
        if (exportStatement.whereUsed.size < 1) {
          context.report(node, `exported declaration '${value}' not used within other modules`);
        }
      } else {
        context.report(node, `exported declaration '${value}' not used within other modules`);
      }
    };

    /**
     * only useful for tools like vscode-eslint
     *
     * update lists of existing exports during runtime
     */
    const updateExportUsage = node => {
      if (ignoredFiles.has(file)) {
        return;
      }

      let exports = exportList.get(file);

      // new module has been created during runtime
      // include it in further processing
      if (typeof exports === 'undefined') {
        exports = new Map();
      }

      const newExports = new Map();
      const newExportIdentifiers = new Set();

      node.body.forEach((_ref8) => {
        let type = _ref8.type,
            declaration = _ref8.declaration,
            specifiers = _ref8.specifiers;

        if (type === EXPORT_DEFAULT_DECLARATION) {
          newExportIdentifiers.add(IMPORT_DEFAULT_SPECIFIER);
        }
        if (type === EXPORT_NAMED_DECLARATION) {
          if (specifiers.length > 0) {
            specifiers.forEach(specifier => {
              if (specifier.exported) {
                newExportIdentifiers.add(specifier.exported.name);
              }
            });
          }
          if (declaration) {
            if (declaration.type === FUNCTION_DECLARATION || declaration.type === CLASS_DECLARATION) {
              newExportIdentifiers.add(declaration.id.name);
            }
            if (declaration.type === VARIABLE_DECLARATION) {
              declaration.declarations.forEach((_ref9) => {
                let id = _ref9.id;

                newExportIdentifiers.add(id.name);
              });
            }
          }
        }
      });

      // old exports exist within list of new exports identifiers: add to map of new exports
      exports.forEach((value, key) => {
        if (newExportIdentifiers.has(key)) {
          newExports.set(key, value);
        }
      });

      // new export identifiers added: add to map of new exports
      newExportIdentifiers.forEach(key => {
        if (!exports.has(key)) {
          newExports.set(key, { whereUsed: new Set() });
        }
      });

      // preserve information about namespace imports
      let exportAll = exports.get(EXPORT_ALL_DECLARATION);
      let namespaceImports = exports.get(IMPORT_NAMESPACE_SPECIFIER);

      if (typeof namespaceImports === 'undefined') {
        namespaceImports = { whereUsed: new Set() };
      }

      newExports.set(EXPORT_ALL_DECLARATION, exportAll);
      newExports.set(IMPORT_NAMESPACE_SPECIFIER, namespaceImports);
      exportList.set(file, newExports);
    };

    /**
     * only useful for tools like vscode-eslint
     *
     * update lists of existing imports during runtime
     */
    const updateImportUsage = node => {
      if (!unusedExports) {
        return;
      }

      let oldImportPaths = importList.get(file);
      if (typeof oldImportPaths === 'undefined') {
        oldImportPaths = new Map();
      }

      const oldNamespaceImports = new Set();
      const newNamespaceImports = new Set();

      const oldExportAll = new Set();
      const newExportAll = new Set();

      const oldDefaultImports = new Set();
      const newDefaultImports = new Set();

      const oldImports = new Map();
      const newImports = new Map();
      oldImportPaths.forEach((value, key) => {
        if (value.has(EXPORT_ALL_DECLARATION)) {
          oldExportAll.add(key);
        }
        if (value.has(IMPORT_NAMESPACE_SPECIFIER)) {
          oldNamespaceImports.add(key);
        }
        if (value.has(IMPORT_DEFAULT_SPECIFIER)) {
          oldDefaultImports.add(key);
        }
        value.forEach(val => {
          if (val !== IMPORT_NAMESPACE_SPECIFIER && val !== IMPORT_DEFAULT_SPECIFIER) {
            oldImports.set(val, key);
          }
        });
      });

      node.body.forEach(astNode => {
        let resolvedPath;

        // support for export { value } from 'module'
        if (astNode.type === EXPORT_NAMED_DECLARATION) {
          if (astNode.source) {
            resolvedPath = (0, _resolve2.default)(astNode.source.raw.replace(/('|")/g, ''), context);
            astNode.specifiers.forEach(specifier => {
              let name;
              if (specifier.exported.name === DEFAULT) {
                name = IMPORT_DEFAULT_SPECIFIER;
              } else {
                name = specifier.local.name;
              }
              newImports.set(name, resolvedPath);
            });
          }
        }

        if (astNode.type === EXPORT_ALL_DECLARATION) {
          resolvedPath = (0, _resolve2.default)(astNode.source.raw.replace(/('|")/g, ''), context);
          newExportAll.add(resolvedPath);
        }

        if (astNode.type === IMPORT_DECLARATION) {
          resolvedPath = (0, _resolve2.default)(astNode.source.raw.replace(/('|")/g, ''), context);
          if (!resolvedPath) {
            return;
          }

          if (isNodeModule(resolvedPath)) {
            return;
          }

          if (newNamespaceImportExists(astNode.specifiers)) {
            newNamespaceImports.add(resolvedPath);
          }

          if (newDefaultImportExists(astNode.specifiers)) {
            newDefaultImports.add(resolvedPath);
          }

          astNode.specifiers.forEach(specifier => {
            if (specifier.type === IMPORT_DEFAULT_SPECIFIER || specifier.type === IMPORT_NAMESPACE_SPECIFIER) {
              return;
            }
            newImports.set(specifier.imported.name, resolvedPath);
          });
        }
      });

      newExportAll.forEach(value => {
        if (!oldExportAll.has(value)) {
          let imports = oldImportPaths.get(value);
          if (typeof imports === 'undefined') {
            imports = new Set();
          }
          imports.add(EXPORT_ALL_DECLARATION);
          oldImportPaths.set(value, imports);

          let exports = exportList.get(value);
          let currentExport;
          if (typeof exports !== 'undefined') {
            currentExport = exports.get(EXPORT_ALL_DECLARATION);
          } else {
            exports = new Map();
            exportList.set(value, exports);
          }

          if (typeof currentExport !== 'undefined') {
            currentExport.whereUsed.add(file);
          } else {
            const whereUsed = new Set();
            whereUsed.add(file);
            exports.set(EXPORT_ALL_DECLARATION, { whereUsed });
          }
        }
      });

      oldExportAll.forEach(value => {
        if (!newExportAll.has(value)) {
          const imports = oldImportPaths.get(value);
          imports.delete(EXPORT_ALL_DECLARATION);

          const exports = exportList.get(value);
          if (typeof exports !== 'undefined') {
            const currentExport = exports.get(EXPORT_ALL_DECLARATION);
            if (typeof currentExport !== 'undefined') {
              currentExport.whereUsed.delete(file);
            }
          }
        }
      });

      newDefaultImports.forEach(value => {
        if (!oldDefaultImports.has(value)) {
          let imports = oldImportPaths.get(value);
          if (typeof imports === 'undefined') {
            imports = new Set();
          }
          imports.add(IMPORT_DEFAULT_SPECIFIER);
          oldImportPaths.set(value, imports);

          let exports = exportList.get(value);
          let currentExport;
          if (typeof exports !== 'undefined') {
            currentExport = exports.get(IMPORT_DEFAULT_SPECIFIER);
          } else {
            exports = new Map();
            exportList.set(value, exports);
          }

          if (typeof currentExport !== 'undefined') {
            currentExport.whereUsed.add(file);
          } else {
            const whereUsed = new Set();
            whereUsed.add(file);
            exports.set(IMPORT_DEFAULT_SPECIFIER, { whereUsed });
          }
        }
      });

      oldDefaultImports.forEach(value => {
        if (!newDefaultImports.has(value)) {
          const imports = oldImportPaths.get(value);
          imports.delete(IMPORT_DEFAULT_SPECIFIER);

          const exports = exportList.get(value);
          if (typeof exports !== 'undefined') {
            const currentExport = exports.get(IMPORT_DEFAULT_SPECIFIER);
            if (typeof currentExport !== 'undefined') {
              currentExport.whereUsed.delete(file);
            }
          }
        }
      });

      newNamespaceImports.forEach(value => {
        if (!oldNamespaceImports.has(value)) {
          let imports = oldImportPaths.get(value);
          if (typeof imports === 'undefined') {
            imports = new Set();
          }
          imports.add(IMPORT_NAMESPACE_SPECIFIER);
          oldImportPaths.set(value, imports);

          let exports = exportList.get(value);
          let currentExport;
          if (typeof exports !== 'undefined') {
            currentExport = exports.get(IMPORT_NAMESPACE_SPECIFIER);
          } else {
            exports = new Map();
            exportList.set(value, exports);
          }

          if (typeof currentExport !== 'undefined') {
            currentExport.whereUsed.add(file);
          } else {
            const whereUsed = new Set();
            whereUsed.add(file);
            exports.set(IMPORT_NAMESPACE_SPECIFIER, { whereUsed });
          }
        }
      });

      oldNamespaceImports.forEach(value => {
        if (!newNamespaceImports.has(value)) {
          const imports = oldImportPaths.get(value);
          imports.delete(IMPORT_NAMESPACE_SPECIFIER);

          const exports = exportList.get(value);
          if (typeof exports !== 'undefined') {
            const currentExport = exports.get(IMPORT_NAMESPACE_SPECIFIER);
            if (typeof currentExport !== 'undefined') {
              currentExport.whereUsed.delete(file);
            }
          }
        }
      });

      newImports.forEach((value, key) => {
        if (!oldImports.has(key)) {
          let imports = oldImportPaths.get(value);
          if (typeof imports === 'undefined') {
            imports = new Set();
          }
          imports.add(key);
          oldImportPaths.set(value, imports);

          let exports = exportList.get(value);
          let currentExport;
          if (typeof exports !== 'undefined') {
            currentExport = exports.get(key);
          } else {
            exports = new Map();
            exportList.set(value, exports);
          }

          if (typeof currentExport !== 'undefined') {
            currentExport.whereUsed.add(file);
          } else {
            const whereUsed = new Set();
            whereUsed.add(file);
            exports.set(key, { whereUsed });
          }
        }
      });

      oldImports.forEach((value, key) => {
        if (!newImports.has(key)) {
          const imports = oldImportPaths.get(value);
          imports.delete(key);

          const exports = exportList.get(value);
          if (typeof exports !== 'undefined') {
            const currentExport = exports.get(key);
            if (typeof currentExport !== 'undefined') {
              currentExport.whereUsed.delete(file);
            }
          }
        }
      });
    };

    return {
      'Program:exit': node => {
        updateExportUsage(node);
        updateImportUsage(node);
        checkExportPresence(node);
      },
      'ExportDefaultDeclaration': node => {
        checkUsage(node, IMPORT_DEFAULT_SPECIFIER);
      },
      'ExportNamedDeclaration': node => {
        node.specifiers.forEach(specifier => {
          checkUsage(node, specifier.exported.name);
        });
        if (node.declaration) {
          if (node.declaration.type === FUNCTION_DECLARATION || node.declaration.type === CLASS_DECLARATION) {
            checkUsage(node, node.declaration.id.name);
          }
          if (node.declaration.type === VARIABLE_DECLARATION) {
            node.declaration.declarations.forEach(declaration => {
              checkUsage(node, declaration.id.name);
            });
          }
        }
      }
    };
  }
};
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9ydWxlcy9uby11bnVzZWQtbW9kdWxlcy5qcyJdLCJuYW1lcyI6WyJsaXN0RmlsZXNUb1Byb2Nlc3MiLCJGaWxlRW51bWVyYXRvciIsInJlcXVpcmUiLCJzcmMiLCJlIiwiQXJyYXkiLCJmcm9tIiwiaXRlcmF0ZUZpbGVzIiwiZmlsZVBhdGgiLCJpZ25vcmVkIiwiZmlsZW5hbWUiLCJlMSIsImUyIiwiRVhQT1JUX0RFRkFVTFRfREVDTEFSQVRJT04iLCJFWFBPUlRfTkFNRURfREVDTEFSQVRJT04iLCJFWFBPUlRfQUxMX0RFQ0xBUkFUSU9OIiwiSU1QT1JUX0RFQ0xBUkFUSU9OIiwiSU1QT1JUX05BTUVTUEFDRV9TUEVDSUZJRVIiLCJJTVBPUlRfREVGQVVMVF9TUEVDSUZJRVIiLCJWQVJJQUJMRV9ERUNMQVJBVElPTiIsIkZVTkNUSU9OX0RFQ0xBUkFUSU9OIiwiQ0xBU1NfREVDTEFSQVRJT04iLCJERUZBVUxUIiwicHJlcGFyYXRpb25Eb25lIiwiaW1wb3J0TGlzdCIsIk1hcCIsImV4cG9ydExpc3QiLCJpZ25vcmVkRmlsZXMiLCJTZXQiLCJmaWxlc091dHNpZGVTcmMiLCJpc05vZGVNb2R1bGUiLCJwYXRoIiwidGVzdCIsInJlc29sdmVGaWxlcyIsImlnbm9yZUV4cG9ydHMiLCJzcmNGaWxlcyIsInNyY0ZpbGVMaXN0IiwiaWdub3JlZEZpbGVzTGlzdCIsImZvckVhY2giLCJhZGQiLCJmaWx0ZXIiLCJwcmVwYXJlSW1wb3J0c0FuZEV4cG9ydHMiLCJjb250ZXh0IiwiZXhwb3J0QWxsIiwiZmlsZSIsImV4cG9ydHMiLCJpbXBvcnRzIiwiY3VycmVudEV4cG9ydHMiLCJFeHBvcnRzIiwiZ2V0IiwiZGVwZW5kZW5jaWVzIiwicmVleHBvcnRzIiwibG9jYWxJbXBvcnRMaXN0IiwibmFtZXNwYWNlIiwiY3VycmVudEV4cG9ydEFsbCIsInZhbHVlIiwic2V0Iiwia2V5Iiwid2hlcmVVc2VkIiwicmVleHBvcnQiLCJnZXRJbXBvcnQiLCJsb2NhbEltcG9ydCIsImN1cnJlbnRWYWx1ZSIsImxvY2FsIiwiaW1wb3J0ZWRTcGVjaWZpZXJzIiwiaGFzIiwidmFsIiwiY3VycmVudEV4cG9ydCIsImRldGVybWluZVVzYWdlIiwibGlzdFZhbHVlIiwibGlzdEtleSIsImN1cnJlbnRJbXBvcnQiLCJzcGVjaWZpZXIiLCJleHBvcnRTdGF0ZW1lbnQiLCJnZXRTcmMiLCJwcm9jZXNzIiwiY3dkIiwiZG9QcmVwYXJhdGlvbiIsIm5ld05hbWVzcGFjZUltcG9ydEV4aXN0cyIsInNwZWNpZmllcnMiLCJzb21lIiwidHlwZSIsIm5ld0RlZmF1bHRJbXBvcnRFeGlzdHMiLCJmaWxlSXNJblBrZyIsInJlYWRQa2dVcCIsInN5bmMiLCJub3JtYWxpemUiLCJwa2ciLCJiYXNlUGF0aCIsImNoZWNrUGtnRmllbGRTdHJpbmciLCJwa2dGaWVsZCIsImNoZWNrUGtnRmllbGRPYmplY3QiLCJwa2dGaWVsZEZpbGVzIiwibWFwIiwiY2hlY2tQa2dGaWVsZCIsInByaXZhdGUiLCJiaW4iLCJicm93c2VyIiwibWFpbiIsIm1vZHVsZSIsIm1ldGEiLCJkb2NzIiwidXJsIiwic2NoZW1hIiwicHJvcGVydGllcyIsImRlc2NyaXB0aW9uIiwibWluSXRlbXMiLCJpdGVtcyIsIm1pbkxlbmd0aCIsIm1pc3NpbmdFeHBvcnRzIiwidW51c2VkRXhwb3J0cyIsIm5vdCIsImVudW0iLCJhbnlPZiIsInJlcXVpcmVkIiwiY3JlYXRlIiwib3B0aW9ucyIsImdldEZpbGVuYW1lIiwiY2hlY2tFeHBvcnRQcmVzZW5jZSIsIm5vZGUiLCJleHBvcnRDb3VudCIsIm5hbWVzcGFjZUltcG9ydHMiLCJkZWxldGUiLCJzaXplIiwicmVwb3J0IiwiYm9keSIsImNoZWNrVXNhZ2UiLCJleHBvcnRlZFZhbHVlIiwidXBkYXRlRXhwb3J0VXNhZ2UiLCJuZXdFeHBvcnRzIiwibmV3RXhwb3J0SWRlbnRpZmllcnMiLCJkZWNsYXJhdGlvbiIsImxlbmd0aCIsImV4cG9ydGVkIiwibmFtZSIsImlkIiwiZGVjbGFyYXRpb25zIiwidXBkYXRlSW1wb3J0VXNhZ2UiLCJvbGRJbXBvcnRQYXRocyIsIm9sZE5hbWVzcGFjZUltcG9ydHMiLCJuZXdOYW1lc3BhY2VJbXBvcnRzIiwib2xkRXhwb3J0QWxsIiwibmV3RXhwb3J0QWxsIiwib2xkRGVmYXVsdEltcG9ydHMiLCJuZXdEZWZhdWx0SW1wb3J0cyIsIm9sZEltcG9ydHMiLCJuZXdJbXBvcnRzIiwiYXN0Tm9kZSIsInJlc29sdmVkUGF0aCIsInNvdXJjZSIsInJhdyIsInJlcGxhY2UiLCJpbXBvcnRlZCJdLCJtYXBwaW5ncyI6Ijs7QUFNQTs7OztBQUNBOzs7O0FBQ0E7Ozs7QUFDQTs7QUFDQTs7OztBQUNBOzs7O0FBQ0E7Ozs7OztnTUFaQTs7Ozs7O0FBY0E7QUFDQTtBQUNBLElBQUlBLGtCQUFKO0FBQ0EsSUFBSTtBQUNGLE1BQUlDLGlCQUFpQkMsUUFBUSx1Q0FBUixFQUFpREQsY0FBdEU7QUFDQUQsdUJBQXFCLFVBQVVHLEdBQVYsRUFBZTtBQUNsQyxRQUFJQyxJQUFJLElBQUlILGNBQUosRUFBUjtBQUNBLFdBQU9JLE1BQU1DLElBQU4sQ0FBV0YsRUFBRUcsWUFBRixDQUFlSixHQUFmLENBQVgsRUFBZ0M7QUFBQSxVQUFHSyxRQUFILFFBQUdBLFFBQUg7QUFBQSxVQUFhQyxPQUFiLFFBQWFBLE9BQWI7QUFBQSxhQUE0QjtBQUNqRUEsZUFEaUU7QUFFakVDLGtCQUFVRjtBQUZ1RCxPQUE1QjtBQUFBLEtBQWhDLENBQVA7QUFJRCxHQU5EO0FBT0QsQ0FURCxDQVNFLE9BQU9HLEVBQVAsRUFBVztBQUNYLE1BQUk7QUFDRlgseUJBQXFCRSxRQUFRLDRCQUFSLEVBQXNDRixrQkFBM0Q7QUFDRCxHQUZELENBRUUsT0FBT1ksRUFBUCxFQUFXO0FBQ1haLHlCQUFxQkUsUUFBUSwyQkFBUixFQUFxQ0Ysa0JBQTFEO0FBQ0Q7QUFDRjs7QUFFRCxNQUFNYSw2QkFBNkIsMEJBQW5DO0FBQ0EsTUFBTUMsMkJBQTJCLHdCQUFqQztBQUNBLE1BQU1DLHlCQUF5QixzQkFBL0I7QUFD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RUFBaUJyRyx3QkFBakI7QUFDRCxPQVJJO0FBU0wsZ0NBQTBCcUcsUUFBUTtBQUNoQ0EsYUFBS3hDLFVBQUwsQ0FBZ0J6QyxPQUFoQixDQUF3QmtDLGFBQWE7QUFDakNzRCxxQkFBV1AsSUFBWCxFQUFpQi9DLFVBQVU2RCxRQUFWLENBQW1CQyxJQUFwQztBQUNILFNBRkQ7QUFHQSxZQUFJZixLQUFLWSxXQUFULEVBQXNCO0FBQ3BCLGNBQ0VaLEtBQUtZLFdBQUwsQ0FBaUJsRCxJQUFqQixLQUEwQjdELG9CQUExQixJQUNBbUcsS0FBS1ksV0FBTCxDQUFpQmxELElBQWpCLEtBQTBCNUQsaUJBRjVCLEVBR0U7QUFDQXlHLHVCQUFXUCxJQUFYLEVBQWlCQSxLQUFLWSxXQUFMLENBQWlCSSxFQUFqQixDQUFvQkQsSUFBckM7QUFDRDtBQUNELGNBQUlmLEtBQUtZLFdBQUwsQ0FBaUJsRCxJQUFqQixLQUEwQjlELG9CQUE5QixFQUFvRDtBQUNsRG9HLGlCQUFLWSxXQUFMLENBQWlCSyxZQUFqQixDQUE4QmxHLE9BQTlCLENBQXNDNkYsZUFBZTtBQUNuREwseUJBQVdQLElBQVgsRUFBaUJZLFlBQVlJLEVBQVosQ0FBZUQsSUFBaEM7QUFDRCxhQUZEO0FBR0Q7QUFDRjtBQUNGO0FBMUJJLEtBQVA7QUE0QkQ7QUE3aEJjLENBQWpCIiwiZmlsZSI6Im5vLXVudXNlZC1tb2R1bGVzLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXHJcbiAqIEBmaWxlT3ZlcnZpZXcgRW5zdXJlcyB0aGF0IG1vZHVsZXMgY29udGFpbiBleHBvcnRzIGFuZC9vciBhbGxcclxuICogbW9kdWxlcyBhcmUgY29uc3VtZWQgd2l0aGluIG90aGVyIG1vZHVsZXMuXHJcbiAqIEBhdXRob3IgUmVuw6kgRmVybWFublxyXG4gKi9cclxuXHJcbmltcG9ydCBFeHBvcnRzIGZyb20gJy4uL0V4cG9ydE1hcCdcclxuaW1wb3J0IHJlc29sdmUgZnJvbSAnZXNsaW50LW1vZHVsZS11dGlscy9yZXNvbHZlJ1xyXG5pbXBvcnQgZG9jc1VybCBmcm9tICcuLi9kb2NzVXJsJ1xyXG5pbXBvcnQgeyBkaXJuYW1lLCBqb2luIH0gZnJvbSAncGF0aCdcclxuaW1wb3J0IHJlYWRQa2dVcCBmcm9tICdyZWFkLXBrZy11cCdcclxuaW1wb3J0IHZhbHVlcyBmcm9tICdvYmplY3QudmFsdWVzJ1xyXG5pbXBvcnQgaW5jbHVkZXMgZnJvbSAnYXJyYXktaW5jbHVkZXMnXHJcblxyXG4vLyBlc2xpbnQvbGliL3V0aWwvZ2xvYi11dGlsIGhhcyBiZWVuIG1vdmVkIHRvIGVzbGludC9saWIvdXRpbC9nbG9iLXV0aWxzIHdpdGggdmVyc2lvbiA1LjNcclxuLy8gYW5kIGhhcyBiZWVuIG1vdmVkIHRvIGVzbGludC9saWIvY2xpLWVuZ2luZS9maWxlLWVudW1lcmF0b3IgaW4gdmVyc2lvbiA2XHJcbmxldCBsaXN0RmlsZXNUb1Byb2Nlc3NcclxudHJ5IHtcclxuICB2YXIgRmlsZUVudW1lcmF0b3IgPSByZXF1aXJlKCdlc2xpbnQvbGliL2NsaS1lbmdpbmUvZmlsZS1lbnVtZXJhdG9yJykuRmlsZUVudW1lcmF0b3JcclxuICBsaXN0RmlsZXNUb1Byb2Nlc3MgPSBmdW5jdGlvbiAoc3JjKSB7XHJcbiAgICB2YXIgZSA9IG5ldyBGaWxlRW51bWVyYXRvcigpXHJcbiAgICByZXR1cm4gQXJyYXkuZnJvbShlLml0ZXJhdGVGaWxlcyhzcmMpLCAoeyBmaWxlUGF0aCwgaWdub3JlZCB9KSA9PiAoe1xyXG4gICAgICBpZ25vcmVkLFxyXG4gICAgICBmaWxlbmFtZTogZmlsZVBhdGgsXHJcbiAgICB9KSlcclxuICB9XHJcbn0gY2F0Y2ggKGUxKSB7XHJcbiAgdHJ5IHtcclxuICAgIGxpc3RGaWxlc1RvUHJvY2VzcyA9IHJlcXVpcmUoJ2VzbGludC9saWIvdXRpbC9nbG9iLXV0aWxzJykubGlzdEZpbGVzVG9Qcm9jZXNzXHJcbiAgfSBjYXRjaCAoZTIpIHtcclxuICAgIGxpc3RGaWxlc1RvUHJvY2VzcyA9IHJlcXVpcmUoJ2VzbGludC9saWIvdXRpbC9nbG9iLXV0aWwnKS5saXN0RmlsZXNUb1Byb2Nlc3NcclxuICB9XHJcbn1cclxuXHJcbmNvbnN0IEVYUE9SVF9ERUZBVUxUX0RFQ0xBUkFUSU9OID0gJ0V4cG9ydERlZmF1bHREZWNsYXJhdGlvbidcclxuY29uc3QgRVhQT1JUX05BTUVEX0RFQ0xBUkFUSU9OID0gJ0V4cG9ydE5hbWVkRGVjbGFyYXRpb24nXHJcbmNvbnN0IEVYUE9SVF9BTExfREVDTEFSQVRJT04gPSAnRXhwb3J0QWxsRGVjbGFyYXRpb24nXHJcbmNvbnN0IElNUE9SVF9ERUNMQVJBVElPTiA9ICdJbXBvcnREZWNsYXJhdGlvbidcclxuY29uc3QgSU1QT1JUX05BTUVTUEFDRV9TUEVDSUZJRVIgPSAnSW1wb3J0TmFtZXNwYWNlU3BlY2lmaWVyJ1xyXG5jb25zdCBJTVBPUlRfREVGQVVMVF9TUEVDSUZJRVIgPSAnSW1wb3J0RGVmYXVsdFNwZWNpZmllcidcclxuY29uc3QgVkFSSUFCTEVfREVDTEFSQVRJT04gPSAnVmFyaWFibGVEZWNsYXJhdGlvbidcclxuY29uc3QgRlVOQ1RJT05fREVDTEFSQVRJT04gPSAnRnVuY3Rpb25EZWNsYXJhdGlvbidcclxuY29uc3QgQ0xBU1NfREVDTEFSQVRJT04gPSAnQ2xhc3NEZWNsYXJhdGlvbidcclxuY29uc3QgREVGQVVMVCA9ICdkZWZhdWx0J1xyXG5cclxubGV0IHByZXBhcmF0aW9uRG9uZSA9IGZhbHNlXHJcbmNvbnN0IGltcG9ydExpc3QgPSBuZXcgTWFwKClcclxuY29uc3QgZXhwb3J0TGlzdCA9IG5ldyBNYXAoKVxyXG5jb25zdCBpZ25vcmVkRmlsZXMgPSBuZXcgU2V0KClcclxuY29uc3QgZmlsZXNPdXRzaWRlU3JjID0gbmV3IFNldCgpXHJcblxyXG5jb25zdCBpc05vZGVNb2R1bGUgPSBwYXRoID0+IHtcclxuICByZXR1cm4gL1xcLyhub2RlX21vZHVsZXMpXFwvLy50ZXN0KHBhdGgpXHJcbn1cclxuXHJcbi8qKlxyXG4gKiByZWFkIGFsbCBmaWxlcyBtYXRjaGluZyB0aGUgcGF0dGVybnMgaW4gc3JjIGFuZCBpZ25vcmVFeHBvcnRzXHJcbiAqXHJcbiAqIHJldHVybiBhbGwgZmlsZXMgbWF0Y2hpbmcgc3JjIHBhdHRlcm4sIHdoaWNoIGFyZSBub3QgbWF0Y2hpbmcgdGhlIGlnbm9yZUV4cG9ydHMgcGF0dGVyblxyXG4gKi9cclxuY29uc3QgcmVzb2x2ZUZpbGVzID0gKHNyYywgaWdub3JlRXhwb3J0cykgPT4ge1xyXG4gIGNvbnN0IHNyY0ZpbGVzID0gbmV3IFNldCgpXHJcbiAgY29uc3Qgc3JjRmlsZUxpc3QgPSBsaXN0RmlsZXNUb1Byb2Nlc3Moc3JjKVxyXG5cclxuICAvLyBwcmVwYXJlIGxpc3Qgb2YgaWdub3JlZCBmaWxlc1xyXG4gIGNvbnN0IGlnbm9yZWRGaWxlc0xpc3QgPSAgbGlzdEZpbGVzVG9Qcm9jZXNzKGlnbm9yZUV4cG9ydHMpXHJcbiAgaWdub3JlZEZpbGVzTGlzdC5mb3JFYWNoKCh7IGZpbGVuYW1lIH0pID0+IGlnbm9yZWRGaWxlcy5hZGQoZmlsZW5hbWUpKVxyXG5cclxuICAvLyBwcmVwYXJlIGxpc3Qgb2Ygc291cmNlIGZpbGVzLCBkb24ndCBjb25zaWRlciBmaWxlcyBmcm9tIG5vZGVfbW9kdWxlc1xyXG4gIHNyY0ZpbGVMaXN0LmZpbHRlcigoeyBmaWxlbmFtZSB9KSA9PiAhaXNOb2RlTW9kdWxlKGZpbGVuYW1lKSkuZm9yRWFjaCgoeyBmaWxlbmFtZSB9KSA9PiB7XHJcbiAgICBzcmNGaWxlcy5hZGQoZmlsZW5hbWUpXHJcbiAgfSlcclxuICByZXR1cm4gc3JjRmlsZXNcclxufVxyXG5cclxuLyoqXHJcbiAqIHBhcnNlIGFsbCBzb3VyY2UgZmlsZXMgYW5kIGJ1aWxkIHVwIDIgbWFwcyBjb250YWluaW5nIHRoZSBleGlzdGluZyBpbXBvcnRzIGFuZCBleHBvcnRzXHJcbiAqL1xyXG5jb25zdCBwcmVwYXJlSW1wb3J0c0FuZEV4cG9ydHMgPSAoc3JjRmlsZXMsIGNvbnRleHQpID0+IHtcclxuICBjb25zdCBleHBvcnRBbGwgPSBuZXcgTWFwKClcclxuICBzcmNGaWxlcy5mb3JFYWNoKGZpbGUgPT4ge1xyXG4gICAgY29uc3QgZXhwb3J0cyA9IG5ldyBNYXAoKVxyXG4gICAgY29uc3QgaW1wb3J0cyA9IG5ldyBNYXAoKVxyXG4gICAgY29uc3QgY3VycmVudEV4cG9ydHMgPSBFeHBvcnRzLmdldChmaWxlLCBjb250ZXh0KVxyXG4gICAgaWYgKGN1cnJlbnRFeHBvcnRzKSB7XHJcbiAgICAgIGNvbnN0IHsgZGVwZW5kZW5jaWVzLCByZWV4cG9ydHMsIGltcG9ydHM6IGxvY2FsSW1wb3J0TGlzdCwgbmFtZXNwYWNlICB9ID0gY3VycmVudEV4cG9ydHNcclxuXHJcbiAgICAgIC8vIGRlcGVuZGVuY2llcyA9PT0gZXhwb3J0ICogZnJvbVxyXG4gICAgICBjb25zdCBjdXJyZW50RXhwb3J0QWxsID0gbmV3IFNldCgpXHJcbiAgICAgIGRlcGVuZGVuY2llcy5mb3JFYWNoKHZhbHVlID0+IHtcclxuICAgICAgICBjdXJyZW50RXhwb3J0QWxsLmFkZCh2YWx1ZSgpLnBhdGgpXHJcbiAgICAgIH0pXHJcbiAgICAgIGV4cG9ydEFsbC5zZXQoZmlsZSwgY3VycmVudEV4cG9ydEFsbClcclxuXHJcbiAgICAgIHJlZXhwb3J0cy5mb3JFYWNoKCh2YWx1ZSwga2V5KSA9PiB7XHJcbiAgICAgICAgaWYgKGtleSA9PT0gREVGQVVMVCkge1xyXG4gICAgICAgICAgZXhwb3J0cy5zZXQoSU1QT1JUX0RFRkFVTFRfU1BFQ0lGSUVSLCB7IHdoZXJlVXNlZDogbmV3IFNldCgpIH0pXHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIGV4cG9ydHMuc2V0KGtleSwgeyB3aGVyZVVzZWQ6IG5ldyBTZXQoKSB9KVxyXG4gICAgICAgIH1cclxuICAgICAgICBjb25zdCByZWV4cG9ydCA9ICB2YWx1ZS5nZXRJbXBvcnQoKVxyXG4gICAgICAgIGlmICghcmVleHBvcnQpIHtcclxuICAgICAgICAgIHJldHVyblxyXG4gICAgICAgIH1cclxuICAgICAgICBsZXQgbG9jYWxJbXBvcnQgPSBpbXBvcnRzLmdldChyZWV4cG9ydC5wYXRoKVxyXG4gICAgICAgIGxldCBjdXJyZW50VmFsdWVcclxuICAgICAgICBpZiAodmFsdWUubG9jYWwgPT09IERFRkFVTFQpIHtcclxuICAgICAgICAgIGN1cnJlbnRWYWx1ZSA9IElNUE9SVF9ERUZBVUxUX1NQRUNJRklFUlxyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICBjdXJyZW50VmFsdWUgPSB2YWx1ZS5sb2NhbFxyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAodHlwZW9mIGxvY2FsSW1wb3J0ICE9PSAndW5kZWZpbmVkJykge1xyXG4gICAgICAgICAgbG9jYWxJbXBvcnQgPSBuZXcgU2V0KFsuLi5sb2NhbEltcG9ydCwgY3VycmVudFZhbHVlXSlcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgbG9jYWxJbXBvcnQgPSBuZXcgU2V0KFtjdXJyZW50VmFsdWVdKVxyXG4gICAgICAgIH1cclxuICAgICAgICBpbXBvcnRzLnNldChyZWV4cG9ydC5wYXRoLCBsb2NhbEltcG9ydClcclxuICAgICAgfSlcclxuXHJcbiAgICAgIGxvY2FsSW1wb3J0TGlzdC5mb3JFYWNoKCh2YWx1ZSwga2V5KSA9PiB7XHJcbiAgICAgICAgaWYgKGlzTm9kZU1vZHVsZShrZXkpKSB7XHJcbiAgICAgICAgICByZXR1cm5cclxuICAgICAgICB9XHJcbiAgICAgICAgaW1wb3J0cy5zZXQoa2V5LCB2YWx1ZS5pbXBvcnRlZFNwZWNpZmllcnMpXHJcbiAgICAgIH0pXHJcbiAgICAgIGltcG9ydExpc3Quc2V0KGZpbGUsIGltcG9ydHMpXHJcblxyXG4gICAgICAvLyBidWlsZCB1cCBleHBvcnQgbGlzdCBvbmx5LCBpZiBmaWxlIGlzIG5vdCBpZ25vcmVkXHJcbiAgICAgIGlmIChpZ25vcmVkRmlsZXMuaGFzKGZpbGUpKSB7XHJcbiAgICAgICAgcmV0dXJuXHJcbiAgICAgIH1cclxuICAgICAgbmFtZXNwYWNlLmZvckVhY2goKHZhbHVlLCBrZXkpID0+IHtcclxuICAgICAgICBpZiAoa2V5ID09PSBERUZBVUxUKSB7XHJcbiAgICAgICAgICBleHBvcnRzLnNldChJTVBPUlRfREVGQVVMVF9TUEVDSUZJRVIsIHsgd2hlcmVVc2VkOiBuZXcgU2V0KCkgfSlcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgZXhwb3J0cy5zZXQoa2V5LCB7IHdoZXJlVXNlZDogbmV3IFNldCgpIH0pXHJcbiAgICAgICAgfVxyXG4gICAgICB9KVxyXG4gICAgfVxyXG4gICAgZXhwb3J0cy5zZXQoRVhQT1JUX0FMTF9ERUNMQVJBVElPTiwgeyB3aGVyZVVzZWQ6IG5ldyBTZXQoKSB9KVxyXG4gICAgZXhwb3J0cy5zZXQoSU1QT1JUX05BTUVTUEFDRV9TUEVDSUZJRVIsIHsgd2hlcmVVc2VkOiBuZXcgU2V0KCkgfSlcclxuICAgIGV4cG9ydExpc3Quc2V0KGZpbGUsIGV4cG9ydHMpXHJcbiAgfSlcclxuICBleHBvcnRBbGwuZm9yRWFjaCgodmFsdWUsIGtleSkgPT4ge1xyXG4gICAgdmFsdWUuZm9yRWFjaCh2YWwgPT4ge1xyXG4gICAgICBjb25zdCBjdXJyZW50RXhwb3J0cyA9IGV4cG9ydExpc3QuZ2V0KHZhbClcclxuICAgICAgY29uc3QgY3VycmVudEV4cG9ydCA9IGN1cnJlbnRFeHBvcnRzLmdldChFWFBPUlRfQUxMX0RFQ0xBUkFUSU9OKVxyXG4gICAgICBjdXJyZW50RXhwb3J0LndoZXJlVXNlZC5hZGQoa2V5KVxyXG4gICAgfSlcclxuICB9KVxyXG59XHJcblxyXG4vKipcclxuICogdHJhdmVyc2UgdGhyb3VnaCBhbGwgaW1wb3J0cyBhbmQgYWRkIHRoZSByZXNwZWN0aXZlIHBhdGggdG8gdGhlIHdoZXJlVXNlZC1saXN0XHJcbiAqIG9mIHRoZSBjb3JyZXNwb25kaW5nIGV4cG9ydFxyXG4gKi9cclxuY29uc3QgZGV0ZXJtaW5lVXNhZ2UgPSAoKSA9PiB7XHJcbiAgaW1wb3J0TGlzdC5mb3JFYWNoKChsaXN0VmFsdWUsIGxpc3RLZXkpID0+IHtcclxuICAgIGxpc3RWYWx1ZS5mb3JFYWNoKCh2YWx1ZSwga2V5KSA9PiB7XHJcbiAgICAgIGNvbnN0IGV4cG9ydHMgPSBleHBvcnRMaXN0LmdldChrZXkpXHJcbiAgICAgIGlmICh0eXBlb2YgZXhwb3J0cyAhPT0gJ3VuZGVmaW5lZCcpIHtcclxuICAgICAgICB2YWx1ZS5mb3JFYWNoKGN1cnJlbnRJbXBvcnQgPT4ge1xyXG4gICAgICAgICAgbGV0IHNwZWNpZmllclxyXG4gICAgICAgICAgaWYgKGN1cnJlbnRJbXBvcnQgPT09IElNUE9SVF9OQU1FU1BBQ0VfU1BFQ0lGSUVSKSB7XHJcbiAgICAgICAgICAgIHNwZWNpZmllciA9IElNUE9SVF9OQU1FU1BBQ0VfU1BFQ0lGSUVSXHJcbiAgICAgICAgICB9IGVsc2UgaWYgKGN1cnJlbnRJbXBvcnQgPT09IElNUE9SVF9ERUZBVUxUX1NQRUNJRklFUikge1xyXG4gICAgICAgICAgICBzcGVjaWZpZXIgPSBJTVBPUlRfREVGQVVMVF9TUEVDSUZJRVJcclxuICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHNwZWNpZmllciA9IGN1cnJlbnRJbXBvcnRcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIGlmICh0eXBlb2Ygc3BlY2lmaWVyICE9PSAndW5kZWZpbmVkJykge1xyXG4gICAgICAgICAgICBjb25zdCBleHBvcnRTdGF0ZW1lbnQgPSBleHBvcnRzLmdldChzcGVjaWZpZXIpXHJcbiAgICAgICAgICAgIGlmICh0eXBlb2YgZXhwb3J0U3RhdGVtZW50ICE9PSAndW5kZWZpbmVkJykge1xyXG4gICAgICAgICAgICAgIGNvbnN0IHsgd2hlcmVVc2VkIH0gPSBleHBvcnRTdGF0ZW1lbnRcclxuICAgICAgICAgICAgICB3aGVyZVVzZWQuYWRkKGxpc3RLZXkpXHJcbiAgICAgICAgICAgICAgZXhwb3J0cy5zZXQoc3BlY2lmaWVyLCB7IHdoZXJlVXNlZCB9KVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfSlcclxuICAgICAgfVxyXG4gICAgfSlcclxuICB9KVxyXG59XHJcblxyXG5jb25zdCBnZXRTcmMgPSBzcmMgPT4ge1xyXG4gIGlmIChzcmMpIHtcclxuICAgIHJldHVybiBzcmNcclxuICB9XHJcbiAgcmV0dXJuIFtwcm9jZXNzLmN3ZCgpXVxyXG59XHJcblxyXG4vKipcclxuICogcHJlcGFyZSB0aGUgbGlzdHMgb2YgZXhpc3RpbmcgaW1wb3J0cyBhbmQgZXhwb3J0cyAtIHNob3VsZCBvbmx5IGJlIGV4ZWN1dGVkIG9uY2UgYXRcclxuICogdGhlIHN0YXJ0IG9mIGEgbmV3IGVzbGludCBydW5cclxuICovXHJcbmxldCBzcmNGaWxlc1xyXG5jb25zdCBkb1ByZXBhcmF0aW9uID0gKHNyYywgaWdub3JlRXhwb3J0cywgY29udGV4dCkgPT4ge1xyXG4gIHNyY0ZpbGVzID0gcmVzb2x2ZUZpbGVzKGdldFNyYyhzcmMpLCBpZ25vcmVFeHBvcnRzKVxyXG4gIHByZXBhcmVJbXBvcnRzQW5kRXhwb3J0cyhzcmNGaWxlcywgY29udGV4dClcclxuICBkZXRlcm1pbmVVc2FnZSgpXHJcbiAgcHJlcGFyYXRpb25Eb25lID0gdHJ1ZVxyXG59XHJcblxyXG5jb25zdCBuZXdOYW1lc3BhY2VJbXBvcnRFeGlzdHMgPSBzcGVjaWZpZXJzID0+XHJcbiAgc3BlY2lmaWVycy5zb21lKCh7IHR5cGUgfSkgPT4gdHlwZSA9PT0gSU1QT1JUX05BTUVTUEFDRV9TUEVDSUZJRVIpXHJcblxyXG5jb25zdCBuZXdEZWZhdWx0SW1wb3J0RXhpc3RzID0gc3BlY2lmaWVycyA9PlxyXG4gIHNwZWNpZmllcnMuc29tZSgoeyB0eXBlIH0pID0+IHR5cGUgPT09IElNUE9SVF9ERUZBVUxUX1NQRUNJRklFUilcclxuXHJcbmNvbnN0IGZpbGVJc0luUGtnID0gZmlsZSA9PiB7XHJcbiAgY29uc3QgeyBwYXRoLCBwa2cgfSA9IHJlYWRQa2dVcC5zeW5jKHtjd2Q6IGZpbGUsIG5vcm1hbGl6ZTogZmFsc2V9KVxyXG4gIGNvbnN0IGJhc2VQYXRoID0gZGlybmFtZShwYXRoKVxyXG5cclxuICBjb25zdCBjaGVja1BrZ0ZpZWxkU3RyaW5nID0gcGtnRmllbGQgPT4ge1xyXG4gICAgaWYgKGpvaW4oYmFzZVBhdGgsIHBrZ0ZpZWxkKSA9PT0gZmlsZSkge1xyXG4gICAgICAgIHJldHVybiB0cnVlXHJcbiAgICAgIH1cclxuICB9XHJcblxyXG4gIGNvbnN0IGNoZWNrUGtnRmllbGRPYmplY3QgPSBwa2dGaWVsZCA9PiB7XHJcbiAgICAgIGNvbnN0IHBrZ0ZpZWxkRmlsZXMgPSB2YWx1ZXMocGtnRmllbGQpLm1hcCh2YWx1ZSA9PiBqb2luKGJhc2VQYXRoLCB2YWx1ZSkpXHJcbiAgICAgIGlmIChpbmNsdWRlcyhwa2dGaWVsZEZpbGVzLCBmaWxlKSkge1xyXG4gICAgICAgIHJldHVybiB0cnVlXHJcbiAgICAgIH1cclxuICB9XHJcblxyXG4gIGNvbnN0IGNoZWNrUGtnRmllbGQgPSBwa2dGaWVsZCA9PiB7XHJcbiAgICBpZiAodHlwZW9mIHBrZ0ZpZWxkID09PSAnc3RyaW5nJykge1xyXG4gICAgICByZXR1cm4gY2hlY2tQa2dGaWVsZFN0cmluZyhwa2dGaWVsZClcclxuICAgIH1cclxuXHJcbiAgICBpZiAodHlwZW9mIHBrZ0ZpZWxkID09PSAnb2JqZWN0Jykge1xyXG4gICAgICByZXR1cm4gY2hlY2tQa2dGaWVsZE9iamVjdChwa2dGaWVsZClcclxuICAgIH1cclxuICB9XHJcblxyXG4gIGlmIChwa2cucHJpdmF0ZSA9PT0gdHJ1ZSkge1xyXG4gICAgcmV0dXJuIGZhbHNlXHJcbiAgfVxyXG5cclxuICBpZiAocGtnLmJpbikge1xyXG4gICAgaWYgKGNoZWNrUGtnRmllbGQocGtnLmJpbikpIHtcclxuICAgICAgcmV0dXJuIHRydWVcclxuICAgIH1cclxuICB9XHJcblxyXG4gIGlmIChwa2cuYnJvd3Nlcikge1xyXG4gICAgaWYgKGNoZWNrUGtnRmllbGQocGtnLmJyb3dzZXIpKSB7XHJcbiAgICAgIHJldHVybiB0cnVlXHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBpZiAocGtnLm1haW4pIHtcclxuICAgIGlmIChjaGVja1BrZ0ZpZWxkU3RyaW5nKHBrZy5tYWluKSkge1xyXG4gICAgICByZXR1cm4gdHJ1ZVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgcmV0dXJuIGZhbHNlXHJcbn1cclxuXHJcbm1vZHVsZS5leHBvcnRzID0ge1xyXG4gIG1ldGE6IHtcclxuICAgIGRvY3M6IHsgdXJsOiBkb2NzVXJsKCduby11bnVzZWQtbW9kdWxlcycpIH0sXHJcbiAgICBzY2hlbWE6IFt7XHJcbiAgICAgIHByb3BlcnRpZXM6IHtcclxuICAgICAgICBzcmM6IHtcclxuICAgICAgICAgIGRlc2NyaXB0aW9uOiAnZmlsZXMvcGF0aHMgdG8gYmUgYW5hbHl6ZWQgKG9ubHkgZm9yIHVudXNlZCBleHBvcnRzKScsXHJcbiAgICAgICAgICB0eXBlOiAnYXJyYXknLFxyXG4gICAgICAgICAgbWluSXRlbXM6IDEsXHJcbiAgICAgICAgICBpdGVtczoge1xyXG4gICAgICAgICAgICB0eXBlOiAnc3RyaW5nJyxcclxuICAgICAgICAgICAgbWluTGVuZ3RoOiAxLFxyXG4gICAgICAgICAgfSxcclxuICAgICAgICB9LFxyXG4gICAgICAgIGlnbm9yZUV4cG9ydHM6IHtcclxuICAgICAgICAgIGRlc2NyaXB0aW9uOlxyXG4gICAgICAgICAgICAnZmlsZXMvcGF0aHMgZm9yIHdoaWNoIHVudXNlZCBleHBvcnRzIHdpbGwgbm90IGJlIHJlcG9ydGVkIChlLmcgbW9kdWxlIGVudHJ5IHBvaW50cyknLFxyXG4gICAgICAgICAgdHlwZTogJ2FycmF5JyxcclxuICAgICAgICAgIG1pbkl0ZW1zOiAxLFxyXG4gICAgICAgICAgaXRlbXM6IHtcclxuICAgICAgICAgICAgdHlwZTogJ3N0cmluZycsXHJcbiAgICAgICAgICAgIG1pbkxlbmd0aDogMSxcclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgfSxcclxuICAgICAgICBtaXNzaW5nRXhwb3J0czoge1xyXG4gICAgICAgICAgZGVzY3JpcHRpb246ICdyZXBvcnQgbW9kdWxlcyB3aXRob3V0IGFueSBleHBvcnRzJyxcclxuICAgICAgICAgIHR5cGU6ICdib29sZWFuJyxcclxuICAgICAgICB9LFxyXG4gICAgICAgIHVudXNlZEV4cG9ydHM6IHtcclxuICAgICAgICAgIGRlc2NyaXB0aW9uOiAncmVwb3J0IGV4cG9ydHMgd2l0aG91dCBhbnkgdXNhZ2UnLFxyXG4gICAgICAgICAgdHlwZTogJ2Jvb2xlYW4nLFxyXG4gICAgICAgIH0sXHJcbiAgICAgIH0sXHJcbiAgICAgIG5vdDoge1xyXG4gICAgICAgIHByb3BlcnRpZXM6IHtcclxuICAgICAgICAgIHVudXNlZEV4cG9ydHM6IHsgZW51bTogW2ZhbHNlXSB9LFxyXG4gICAgICAgICAgbWlzc2luZ0V4cG9ydHM6IHsgZW51bTogW2ZhbHNlXSB9LFxyXG4gICAgICAgIH0sXHJcbiAgICAgIH0sXHJcbiAgICAgIGFueU9mOlt7XHJcbiAgICAgICAgbm90OiB7XHJcbiAgICAgICAgICBwcm9wZXJ0aWVzOiB7XHJcbiAgICAgICAgICAgIHVudXNlZEV4cG9ydHM6IHsgZW51bTogW3RydWVdIH0sXHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgcmVxdWlyZWQ6IFsnbWlzc2luZ0V4cG9ydHMnXSxcclxuICAgICAgfSwge1xyXG4gICAgICAgIG5vdDoge1xyXG4gICAgICAgICAgcHJvcGVydGllczoge1xyXG4gICAgICAgICAgICBtaXNzaW5nRXhwb3J0czogeyBlbnVtOiBbdHJ1ZV0gfSxcclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgfSxcclxuICAgICAgICByZXF1aXJlZDogWyd1bnVzZWRFeHBvcnRzJ10sXHJcbiAgICAgIH0sIHtcclxuICAgICAgICBwcm9wZXJ0aWVzOiB7XHJcbiAgICAgICAgICB1bnVzZWRFeHBvcnRzOiB7IGVudW06IFt0cnVlXSB9LFxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgcmVxdWlyZWQ6IFsndW51c2VkRXhwb3J0cyddLFxyXG4gICAgICB9LCB7XHJcbiAgICAgICAgcHJvcGVydGllczoge1xyXG4gICAgICAgICAgbWlzc2luZ0V4cG9ydHM6IHsgZW51bTogW3RydWVdIH0sXHJcbiAgICAgICAgfSxcclxuICAgICAgICByZXF1aXJlZDogWydtaXNzaW5nRXhwb3J0cyddLFxyXG4gICAgICB9XSxcclxuICAgIH1dLFxyXG4gIH0sXHJcblxyXG4gIGNyZWF0ZTogY29udGV4dCA9PiB7XHJcbiAgICBjb25zdCB7XHJcbiAgICAgIHNyYyxcclxuICAgICAgaWdub3JlRXhwb3J0cyA9IFtdLFxyXG4gICAgICBtaXNzaW5nRXhwb3J0cyxcclxuICAgICAgdW51c2VkRXhwb3J0cyxcclxuICAgIH0gPSBjb250ZXh0Lm9wdGlvbnNbMF0gfHwge31cclxuXHJcbiAgICBpZiAodW51c2VkRXhwb3J0cyAmJiAhcHJlcGFyYXRpb25Eb25lKSB7XHJcbiAgICAgIGRvUHJlcGFyYXRpb24oc3JjLCBpZ25vcmVFeHBvcnRzLCBjb250ZXh0KVxyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IGZpbGUgPSBjb250ZXh0LmdldEZpbGVuYW1lKClcclxuXHJcbiAgICBjb25zdCBjaGVja0V4cG9ydFByZXNlbmNlID0gbm9kZSA9PiB7XHJcbiAgICAgIGlmICghbWlzc2luZ0V4cG9ydHMpIHtcclxuICAgICAgICByZXR1cm5cclxuICAgICAgfVxyXG5cclxuICAgICAgaWYgKGlnbm9yZWRGaWxlcy5oYXMoZmlsZSkpIHtcclxuICAgICAgICByZXR1cm5cclxuICAgICAgfVxyXG5cclxuICAgICAgY29uc3QgZXhwb3J0Q291bnQgPSBleHBvcnRMaXN0LmdldChmaWxlKVxyXG4gICAgICBjb25zdCBleHBvcnRBbGwgPSBleHBvcnRDb3VudC5nZXQoRVhQT1JUX0FMTF9ERUNMQVJBVElPTilcclxuICAgICAgY29uc3QgbmFtZXNwYWNlSW1wb3J0cyA9IGV4cG9ydENvdW50LmdldChJTVBPUlRfTkFNRVNQQUNFX1NQRUNJRklFUilcclxuXHJcbiAgICAgIGV4cG9ydENvdW50LmRlbGV0ZShFWFBPUlRfQUxMX0RFQ0xBUkFUSU9OKVxyXG4gICAgICBleHBvcnRDb3VudC5kZWxldGUoSU1QT1JUX05BTUVTUEFDRV9TUEVDSUZJRVIpXHJcbiAgICAgIGlmIChtaXNzaW5nRXhwb3J0cyAmJiBleHBvcnRDb3VudC5zaXplIDwgMSkge1xyXG4gICAgICAgIC8vIG5vZGUuYm9keVswXSA9PT0gJ3VuZGVmaW5lZCcgb25seSBoYXBwZW5zLCBpZiBldmVyeXRoaW5nIGlzIGNvbW1lbnRlZCBvdXQgaW4gdGhlIGZpbGVcclxuICAgICAgICAvLyBiZWluZyBsaW50ZWRcclxuICAgICAgICBjb250ZXh0LnJlcG9ydChub2RlLmJvZHlbMF0gPyBub2RlLmJvZHlbMF0gOiBub2RlLCAnTm8gZXhwb3J0cyBmb3VuZCcpXHJcbiAgICAgIH1cclxuICAgICAgZXhwb3J0Q291bnQuc2V0KEVYUE9SVF9BTExfREVDTEFSQVRJT04sIGV4cG9ydEFsbClcclxuICAgICAgZXhwb3J0Q291bnQuc2V0KElNUE9SVF9OQU1FU1BBQ0VfU1BFQ0lGSUVSLCBuYW1lc3BhY2VJbXBvcnRzKVxyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IGNoZWNrVXNhZ2UgPSAobm9kZSwgZXhwb3J0ZWRWYWx1ZSkgPT4ge1xyXG4gICAgICBpZiAoIXVudXNlZEV4cG9ydHMpIHtcclxuICAgICAgICByZXR1cm5cclxuICAgICAgfVxyXG5cclxuICAgICAgaWYgKGlnbm9yZWRGaWxlcy5oYXMoZmlsZSkpIHtcclxuICAgICAgICByZXR1cm5cclxuICAgICAgfVxyXG5cclxuICAgICAgaWYgKGZpbGVJc0luUGtnKGZpbGUpKSB7XHJcbiAgICAgICAgcmV0dXJuXHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGlmIChmaWxlc091dHNpZGVTcmMuaGFzKGZpbGUpKSB7XHJcbiAgICAgICAgcmV0dXJuXHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8vIG1ha2Ugc3VyZSBmaWxlIHRvIGJlIGxpbnRlZCBpcyBpbmNsdWRlZCBpbiBzb3VyY2UgZmlsZXNcclxuICAgICAgaWYgKCFzcmNGaWxlcy5oYXMoZmlsZSkpIHtcclxuICAgICAgICBzcmNGaWxlcyA9IHJlc29sdmVGaWxlcyhnZXRTcmMoc3JjKSwgaWdub3JlRXhwb3J0cylcclxuICAgICAgICBpZiAoIXNyY0ZpbGVzLmhhcyhmaWxlKSkge1xyXG4gICAgICAgICAgZmlsZXNPdXRzaWRlU3JjLmFkZChmaWxlKVxyXG4gICAgICAgICAgcmV0dXJuXHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcblxyXG4gICAgICBleHBvcnRzID0gZXhwb3J0TGlzdC5nZXQoZmlsZSlcclxuXHJcbiAgICAgIC8vIHNwZWNpYWwgY2FzZTogZXhwb3J0ICogZnJvbVxyXG4gICAgICBjb25zdCBleHBvcnRBbGwgPSBleHBvcnRzLmdldChFWFBPUlRfQUxMX0RFQ0xBUkFUSU9OKVxyXG4gICAgICBpZiAodHlwZW9mIGV4cG9ydEFsbCAhPT0gJ3VuZGVmaW5lZCcgJiYgZXhwb3J0ZWRWYWx1ZSAhPT0gSU1QT1JUX0RFRkFVTFRfU1BFQ0lGSUVSKSB7XHJcbiAgICAgICAgaWYgKGV4cG9ydEFsbC53aGVyZVVzZWQuc2l6ZSA+IDApIHtcclxuICAgICAgICAgIHJldHVyblxyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG5cclxuICAgICAgLy8gc3BlY2lhbCBjYXNlOiBuYW1lc3BhY2UgaW1wb3J0XHJcbiAgICAgIGNvbnN0IG5hbWVzcGFjZUltcG9ydHMgPSBleHBvcnRzLmdldChJTVBPUlRfTkFNRVNQQUNFX1NQRUNJRklFUilcclxuICAgICAgaWYgKHR5cGVvZiBuYW1lc3BhY2VJbXBvcnRzICE9PSAndW5kZWZpbmVkJykge1xyXG4gICAgICAgIGlmIChuYW1lc3BhY2VJbXBvcnRzLndoZXJlVXNlZC5zaXplID4gMCkge1xyXG4gICAgICAgICAgcmV0dXJuXHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcblxyXG4gICAgICBjb25zdCBleHBvcnRTdGF0ZW1lbnQgPSBleHBvcnRzLmdldChleHBvcnRlZFZhbHVlKVxyXG5cclxuICAgICAgY29uc3QgdmFsdWUgPSBleHBvcnRlZFZhbHVlID09PSBJTVBPUlRfREVGQVVMVF9TUEVDSUZJRVIgPyBERUZBVUxUIDogZXhwb3J0ZWRWYWx1ZVxyXG5cclxuICAgICAgaWYgKHR5cGVvZiBleHBvcnRTdGF0ZW1lbnQgIT09ICd1bmRlZmluZWQnKXtcclxuICAgICAgICBpZiAoZXhwb3J0U3RhdGVtZW50LndoZXJlVXNlZC5zaXplIDwgMSkge1xyXG4gICAgICAgICAgY29udGV4dC5yZXBvcnQoXHJcbiAgICAgICAgICAgIG5vZGUsXHJcbiAgICAgICAgICAgIGBleHBvcnRlZCBkZWNsYXJhdGlvbiAnJHt2YWx1ZX0nIG5vdCB1c2VkIHdpdGhpbiBvdGhlciBtb2R1bGVzYFxyXG4gICAgICAgICAgKVxyXG4gICAgICAgIH1cclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICBjb250ZXh0LnJlcG9ydChcclxuICAgICAgICAgIG5vZGUsXHJcbiAgICAgICAgICBgZXhwb3J0ZWQgZGVjbGFyYXRpb24gJyR7dmFsdWV9JyBub3QgdXNlZCB3aXRoaW4gb3RoZXIgbW9kdWxlc2BcclxuICAgICAgICApXHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIG9ubHkgdXNlZnVsIGZvciB0b29scyBsaWtlIHZzY29kZS1lc2xpbnRcclxuICAgICAqXHJcbiAgICAgKiB1cGRhdGUgbGlzdHMgb2YgZXhpc3RpbmcgZXhwb3J0cyBkdXJpbmcgcnVudGltZVxyXG4gICAgICovXHJcbiAgICBjb25zdCB1cGRhdGVFeHBvcnRVc2FnZSA9IG5vZGUgPT4ge1xyXG4gICAgICBpZiAoaWdub3JlZEZpbGVzLmhhcyhmaWxlKSkge1xyXG4gICAgICAgIHJldHVyblxyXG4gICAgICB9XHJcblxyXG4gICAgICBsZXQgZXhwb3J0cyA9IGV4cG9ydExpc3QuZ2V0KGZpbGUpXHJcblxyXG4gICAgICAvLyBuZXcgbW9kdWxlIGhhcyBiZWVuIGNyZWF0ZWQgZHVyaW5nIHJ1bnRpbWVcclxuICAgICAgLy8gaW5jbHVkZSBpdCBpbiBmdXJ0aGVyIHByb2Nlc3NpbmdcclxuICAgICAgaWYgKHR5cGVvZiBleHBvcnRzID09PSAndW5kZWZpbmVkJykge1xyXG4gICAgICAgIGV4cG9ydHMgPSBuZXcgTWFwKClcclxuICAgICAgfVxyXG5cclxuICAgICAgY29uc3QgbmV3RXhwb3J0cyA9IG5ldyBNYXAoKVxyXG4gICAgICBjb25zdCBuZXdFeHBvcnRJZGVudGlmaWVycyA9IG5ldyBTZXQoKVxyXG5cclxuICAgICAgbm9kZS5ib2R5LmZvckVhY2goKHsgdHlwZSwgZGVjbGFyYXRpb24sIHNwZWNpZmllcnMgfSkgPT4ge1xyXG4gICAgICAgIGlmICh0eXBlID09PSBFWFBPUlRfREVGQVVMVF9ERUNMQVJBVElPTikge1xyXG4gICAgICAgICAgbmV3RXhwb3J0SWRlbnRpZmllcnMuYWRkKElNUE9SVF9ERUZBVUxUX1NQRUNJRklFUilcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHR5cGUgPT09IEVYUE9SVF9OQU1FRF9ERUNMQVJBVElPTikge1xyXG4gICAgICAgICAgaWYgKHNwZWNpZmllcnMubGVuZ3RoID4gMCkge1xyXG4gICAgICAgICAgICBzcGVjaWZpZXJzLmZvckVhY2goc3BlY2lmaWVyID0+IHtcclxuICAgICAgICAgICAgICBpZiAoc3BlY2lmaWVyLmV4cG9ydGVkKSB7XHJcbiAgICAgICAgICAgICAgICBuZXdFeHBvcnRJZGVudGlmaWVycy5hZGQoc3BlY2lmaWVyLmV4cG9ydGVkLm5hbWUpXHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgaWYgKGRlY2xhcmF0aW9uKSB7XHJcbiAgICAgICAgICAgIGlmIChcclxuICAgICAgICAgICAgICBkZWNsYXJhdGlvbi50eXBlID09PSBGVU5DVElPTl9ERUNMQVJBVElPTiB8fFxyXG4gICAgICAgICAgICAgIGRlY2xhcmF0aW9uLnR5cGUgPT09IENMQVNTX0RFQ0xBUkFUSU9OXHJcbiAgICAgICAgICAgICkge1xyXG4gICAgICAgICAgICAgIG5ld0V4cG9ydElkZW50aWZpZXJzLmFkZChkZWNsYXJhdGlvbi5pZC5uYW1lKVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChkZWNsYXJhdGlvbi50eXBlID09PSBWQVJJQUJMRV9ERUNMQVJBVElPTikge1xyXG4gICAgICAgICAgICAgIGRlY2xhcmF0aW9uLmRlY2xhcmF0aW9ucy5mb3JFYWNoKCh7IGlkIH0pID0+IHtcclxuICAgICAgICAgICAgICAgIG5ld0V4cG9ydElkZW50aWZpZXJzLmFkZChpZC5uYW1lKVxyXG4gICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgIH0pXHJcblxyXG4gICAgICAvLyBvbGQgZXhwb3J0cyBleGlzdCB3aXRoaW4gbGlzdCBvZiBuZXcgZXhwb3J0cyBpZGVudGlmaWVyczogYWRkIHRvIG1hcCBvZiBuZXcgZXhwb3J0c1xyXG4gICAgICBleHBvcnRzLmZvckVhY2goKHZhbHVlLCBrZXkpID0+IHtcclxuICAgICAgICBpZiAobmV3RXhwb3J0SWRlbnRpZmllcnMuaGFzKGtleSkpIHtcclxuICAgICAgICAgIG5ld0V4cG9ydHMuc2V0KGtleSwgdmFsdWUpXHJcbiAgICAgICAgfVxyXG4gICAgICB9KVxyXG5cclxuICAgICAgLy8gbmV3IGV4cG9ydCBpZGVudGlmaWVycyBhZGRlZDogYWRkIHRvIG1hcCBvZiBuZXcgZXhwb3J0c1xyXG4gICAgICBuZXdFeHBvcnRJZGVudGlmaWVycy5mb3JFYWNoKGtleSA9PiB7XHJcbiAgICAgICAgaWYgKCFleHBvcnRzLmhhcyhrZXkpKSB7XHJcbiAgICAgICAgICBuZXdFeHBvcnRzLnNldChrZXksIHsgd2hlcmVVc2VkOiBuZXcgU2V0KCkgfSlcclxuICAgICAgICB9XHJcbiAgICAgIH0pXHJcblxyXG4gICAgICAvLyBwcmVzZXJ2ZSBpbmZvcm1hdGlvbiBhYm91dCBuYW1lc3BhY2UgaW1wb3J0c1xyXG4gICAgICBsZXQgZXhwb3J0QWxsID0gZXhwb3J0cy5nZXQoRVhQT1JUX0FMTF9ERUNMQVJBVElPTilcclxuICAgICAgbGV0IG5hbWVzcGFjZUltcG9ydHMgPSBleHBvcnRzLmdldChJTVBPUlRfTkFNRVNQQUNFX1NQRUNJRklFUilcclxuXHJcbiAgICAgIGlmICh0eXBlb2YgbmFtZXNwYWNlSW1wb3J0cyA9PT0gJ3VuZGVmaW5lZCcpIHtcclxuICAgICAgICBuYW1lc3BhY2VJbXBvcnRzID0geyB3aGVyZVVzZWQ6IG5ldyBTZXQoKSB9XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIG5ld0V4cG9ydHMuc2V0KEVYUE9SVF9BTExfREVDTEFSQVRJT04sIGV4cG9ydEFsbClcclxuICAgICAgbmV3RXhwb3J0cy5zZXQoSU1QT1JUX05BTUVTUEFDRV9TUEVDSUZJRVIsIG5hbWVzcGFjZUltcG9ydHMpXHJcbiAgICAgIGV4cG9ydExpc3Quc2V0KGZpbGUsIG5ld0V4cG9ydHMpXHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBvbmx5IHVzZWZ1bCBmb3IgdG9vbHMgbGlrZSB2c2NvZGUtZXNsaW50XHJcbiAgICAgKlxyXG4gICAgICogdXBkYXRlIGxpc3RzIG9mIGV4aXN0aW5nIGltcG9ydHMgZHVyaW5nIHJ1bnRpbWVcclxuICAgICAqL1xyXG4gICAgY29uc3QgdXBkYXRlSW1wb3J0VXNhZ2UgPSBub2RlID0+IHtcclxuICAgICAgaWYgKCF1bnVzZWRFeHBvcnRzKSB7XHJcbiAgICAgICAgcmV0dXJuXHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGxldCBvbGRJbXBvcnRQYXRocyA9IGltcG9ydExpc3QuZ2V0KGZpbGUpXHJcbiAgICAgIGlmICh0eXBlb2Ygb2xkSW1wb3J0UGF0aHMgPT09ICd1bmRlZmluZWQnKSB7XHJcbiAgICAgICAgb2xkSW1wb3J0UGF0aHMgPSBuZXcgTWFwKClcclxuICAgICAgfVxyXG5cclxuICAgICAgY29uc3Qgb2xkTmFtZXNwYWNlSW1wb3J0cyA9IG5ldyBTZXQoKVxyXG4gICAgICBjb25zdCBuZXdOYW1lc3BhY2VJbXBvcnRzID0gbmV3IFNldCgpXHJcblxyXG4gICAgICBjb25zdCBvbGRFeHBvcnRBbGwgPSBuZXcgU2V0KClcclxuICAgICAgY29uc3QgbmV3RXhwb3J0QWxsID0gbmV3IFNldCgpXHJcblxyXG4gICAgICBjb25zdCBvbGREZWZhdWx0SW1wb3J0cyA9IG5ldyBTZXQoKVxyXG4gICAgICBjb25zdCBuZXdEZWZhdWx0SW1wb3J0cyA9IG5ldyBTZXQoKVxyXG5cclxuICAgICAgY29uc3Qgb2xkSW1wb3J0cyA9IG5ldyBNYXAoKVxyXG4gICAgICBjb25zdCBuZXdJbXBvcnRzID0gbmV3IE1hcCgpXHJcbiAgICAgIG9sZEltcG9ydFBhdGhzLmZvckVhY2goKHZhbHVlLCBrZXkpID0+IHtcclxuICAgICAgICBpZiAodmFsdWUuaGFzKEVYUE9SVF9BTExfREVDTEFSQVRJT04pKSB7XHJcbiAgICAgICAgICBvbGRFeHBvcnRBbGwuYWRkKGtleSlcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHZhbHVlLmhhcyhJTVBPUlRfTkFNRVNQQUNFX1NQRUNJRklFUikpIHtcclxuICAgICAgICAgIG9sZE5hbWVzcGFjZUltcG9ydHMuYWRkKGtleSlcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHZhbHVlLmhhcyhJTVBPUlRfREVGQVVMVF9TUEVDSUZJRVIpKSB7XHJcbiAgICAgICAgICBvbGREZWZhdWx0SW1wb3J0cy5hZGQoa2V5KVxyXG4gICAgICAgIH1cclxuICAgICAgICB2YWx1ZS5mb3JFYWNoKHZhbCA9PiB7XHJcbiAgICAgICAgICBpZiAodmFsICE9PSBJTVBPUlRfTkFNRVNQQUNFX1NQRUNJRklFUiAmJlxyXG4gICAgICAgICAgICAgIHZhbCAhPT0gSU1QT1JUX0RFRkFVTFRfU1BFQ0lGSUVSKSB7XHJcbiAgICAgICAgICAgICAgIG9sZEltcG9ydHMuc2V0KHZhbCwga2V5KVxyXG4gICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pXHJcbiAgICAgIH0pXHJcblxyXG4gICAgICBub2RlLmJvZHkuZm9yRWFjaChhc3ROb2RlID0+IHtcclxuICAgICAgICBsZXQgcmVzb2x2ZWRQYXRoXHJcblxyXG4gICAgICAgIC8vIHN1cHBvcnQgZm9yIGV4cG9ydCB7IHZhbHVlIH0gZnJvbSAnbW9kdWxlJ1xyXG4gICAgICAgIGlmIChhc3ROb2RlLnR5cGUgPT09IEVYUE9SVF9OQU1FRF9ERUNMQVJBVElPTikge1xyXG4gICAgICAgICAgaWYgKGFzdE5vZGUuc291cmNlKSB7XHJcbiAgICAgICAgICAgIHJlc29sdmVkUGF0aCA9IHJlc29sdmUoYXN0Tm9kZS5zb3VyY2UucmF3LnJlcGxhY2UoLygnfFwiKS9nLCAnJyksIGNvbnRleHQpXHJcbiAgICAgICAgICAgIGFzdE5vZGUuc3BlY2lmaWVycy5mb3JFYWNoKHNwZWNpZmllciA9PiB7XHJcbiAgICAgICAgICAgICAgbGV0IG5hbWVcclxuICAgICAgICAgICAgICBpZiAoc3BlY2lmaWVyLmV4cG9ydGVkLm5hbWUgPT09IERFRkFVTFQpIHtcclxuICAgICAgICAgICAgICAgIG5hbWUgPSBJTVBPUlRfREVGQVVMVF9TUEVDSUZJRVJcclxuICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgbmFtZSA9IHNwZWNpZmllci5sb2NhbC5uYW1lXHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgIG5ld0ltcG9ydHMuc2V0KG5hbWUsIHJlc29sdmVkUGF0aClcclxuICAgICAgICAgICAgfSlcclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChhc3ROb2RlLnR5cGUgPT09IEVYUE9SVF9BTExfREVDTEFSQVRJT04pIHtcclxuICAgICAgICAgIHJlc29sdmVkUGF0aCA9IHJlc29sdmUoYXN0Tm9kZS5zb3VyY2UucmF3LnJlcGxhY2UoLygnfFwiKS9nLCAnJyksIGNvbnRleHQpXHJcbiAgICAgICAgICBuZXdFeHBvcnRBbGwuYWRkKHJlc29sdmVkUGF0aClcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChhc3ROb2RlLnR5cGUgPT09IElNUE9SVF9ERUNMQVJBVElPTikge1xyXG4gICAgICAgICAgcmVzb2x2ZWRQYXRoID0gcmVzb2x2ZShhc3ROb2RlLnNvdXJjZS5yYXcucmVwbGFjZSgvKCd8XCIpL2csICcnKSwgY29udGV4dClcclxuICAgICAgICAgIGlmICghcmVzb2x2ZWRQYXRoKSB7XHJcbiAgICAgICAgICAgIHJldHVyblxyXG4gICAgICAgICAgfVxyXG5cclxuICAgICAgICAgIGlmIChpc05vZGVNb2R1bGUocmVzb2x2ZWRQYXRoKSkge1xyXG4gICAgICAgICAgICByZXR1cm5cclxuICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICBpZiAobmV3TmFtZXNwYWNlSW1wb3J0RXhpc3RzKGFzdE5vZGUuc3BlY2lmaWVycykpIHtcclxuICAgICAgICAgICAgbmV3TmFtZXNwYWNlSW1wb3J0cy5hZGQocmVzb2x2ZWRQYXRoKVxyXG4gICAgICAgICAgfVxyXG5cclxuICAgICAgICAgIGlmIChuZXdEZWZhdWx0SW1wb3J0RXhpc3RzKGFzdE5vZGUuc3BlY2lmaWVycykpIHtcclxuICAgICAgICAgICAgbmV3RGVmYXVsdEltcG9ydHMuYWRkKHJlc29sdmVkUGF0aClcclxuICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICBhc3ROb2RlLnNwZWNpZmllcnMuZm9yRWFjaChzcGVjaWZpZXIgPT4ge1xyXG4gICAgICAgICAgICBpZiAoc3BlY2lmaWVyLnR5cGUgPT09IElNUE9SVF9ERUZBVUxUX1NQRUNJRklFUiB8fFxyXG4gICAgICAgICAgICAgICAgc3BlY2lmaWVyLnR5cGUgPT09IElNUE9SVF9OQU1FU1BBQ0VfU1BFQ0lGSUVSKSB7XHJcbiAgICAgICAgICAgICAgcmV0dXJuXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgbmV3SW1wb3J0cy5zZXQoc3BlY2lmaWVyLmltcG9ydGVkLm5hbWUsIHJlc29sdmVkUGF0aClcclxuICAgICAgICAgIH0pXHJcbiAgICAgICAgfVxyXG4gICAgICB9KVxyXG5cclxuICAgICAgbmV3RXhwb3J0QWxsLmZvckVhY2godmFsdWUgPT4ge1xyXG4gICAgICAgIGlmICghb2xkRXhwb3J0QWxsLmhhcyh2YWx1ZSkpIHtcclxuICAgICAgICAgIGxldCBpbXBvcnRzID0gb2xkSW1wb3J0UGF0aHMuZ2V0KHZhbHVlKVxyXG4gICAgICAgICAgaWYgKHR5cGVvZiBpbXBvcnRzID09PSAndW5kZWZpbmVkJykge1xyXG4gICAgICAgICAgICBpbXBvcnRzID0gbmV3IFNldCgpXHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICBpbXBvcnRzLmFkZChFWFBPUlRfQUxMX0RFQ0xBUkFUSU9OKVxyXG4gICAgICAgICAgb2xkSW1wb3J0UGF0aHMuc2V0KHZhbHVlLCBpbXBvcnRzKVxyXG5cclxuICAgICAgICAgIGxldCBleHBvcnRzID0gZXhwb3J0TGlzdC5nZXQodmFsdWUpXHJcbiAgICAgICAgICBsZXQgY3VycmVudEV4cG9ydFxyXG4gICAgICAgICAgaWYgKHR5cGVvZiBleHBvcnRzICE9PSAndW5kZWZpbmVkJykge1xyXG4gICAgICAgICAgICBjdXJyZW50RXhwb3J0ID0gZXhwb3J0cy5nZXQoRVhQT1JUX0FMTF9ERUNMQVJBVElPTilcclxuICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGV4cG9ydHMgPSBuZXcgTWFwKClcclxuICAgICAgICAgICAgZXhwb3J0TGlzdC5zZXQodmFsdWUsIGV4cG9ydHMpXHJcbiAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgaWYgKHR5cGVvZiBjdXJyZW50RXhwb3J0ICE9PSAndW5kZWZpbmVkJykge1xyXG4gICAgICAgICAgICBjdXJyZW50RXhwb3J0LndoZXJlVXNlZC5hZGQoZmlsZSlcclxuICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGNvbnN0IHdoZXJlVXNlZCA9IG5ldyBTZXQoKVxyXG4gICAgICAgICAgICB3aGVyZVVzZWQuYWRkKGZpbGUpXHJcbiAgICAgICAgICAgIGV4cG9ydHMuc2V0KEVYUE9SVF9BTExfREVDTEFSQVRJT04sIHsgd2hlcmVVc2VkIH0pXHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICB9KVxyXG5cclxuICAgICAgb2xkRXhwb3J0QWxsLmZvckVhY2godmFsdWUgPT4ge1xyXG4gICAgICAgIGlmICghbmV3RXhwb3J0QWxsLmhhcyh2YWx1ZSkpIHtcclxuICAgICAgICAgIGNvbnN0IGltcG9ydHMgPSBvbGRJbXBvcnRQYXRocy5nZXQodmFsdWUpXHJcbiAgICAgICAgICBpbXBvcnRzLmRlbGV0ZShFWFBPUlRfQUxMX0RFQ0xBUkFUSU9OKVxyXG5cclxuICAgICAgICAgIGNvbnN0IGV4cG9ydHMgPSBleHBvcnRMaXN0LmdldCh2YWx1ZSlcclxuICAgICAgICAgIGlmICh0eXBlb2YgZXhwb3J0cyAhPT0gJ3VuZGVmaW5lZCcpIHtcclxuICAgICAgICAgICAgY29uc3QgY3VycmVudEV4cG9ydCA9IGV4cG9ydHMuZ2V0KEVYUE9SVF9BTExfREVDTEFSQVRJT04pXHJcbiAgICAgICAgICAgIGlmICh0eXBlb2YgY3VycmVudEV4cG9ydCAhPT0gJ3VuZGVmaW5lZCcpIHtcclxuICAgICAgICAgICAgICBjdXJyZW50RXhwb3J0LndoZXJlVXNlZC5kZWxldGUoZmlsZSlcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgfSlcclxuXHJcbiAgICAgIG5ld0RlZmF1bHRJbXBvcnRzLmZvckVhY2godmFsdWUgPT4ge1xyXG4gICAgICAgIGlmICghb2xkRGVmYXVsdEltcG9ydHMuaGFzKHZhbHVlKSkge1xyXG4gICAgICAgICAgbGV0IGltcG9ydHMgPSBvbGRJbXBvcnRQYXRocy5nZXQodmFsdWUpXHJcbiAgICAgICAgICBpZiAodHlwZW9mIGltcG9ydHMgPT09ICd1bmRlZmluZWQnKSB7XHJcbiAgICAgICAgICAgIGltcG9ydHMgPSBuZXcgU2V0KClcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIGltcG9ydHMuYWRkKElNUE9SVF9ERUZBVUxUX1NQRUNJRklFUilcclxuICAgICAgICAgIG9sZEltcG9ydFBhdGhzLnNldCh2YWx1ZSwgaW1wb3J0cylcclxuXHJcbiAgICAgICAgICBsZXQgZXhwb3J0cyA9IGV4cG9ydExpc3QuZ2V0KHZhbHVlKVxyXG4gICAgICAgICAgbGV0IGN1cnJlbnRFeHBvcnRcclxuICAgICAgICAgIGlmICh0eXBlb2YgZXhwb3J0cyAhPT0gJ3VuZGVmaW5lZCcpIHtcclxuICAgICAgICAgICAgY3VycmVudEV4cG9ydCA9IGV4cG9ydHMuZ2V0KElNUE9SVF9ERUZBVUxUX1NQRUNJRklFUilcclxuICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGV4cG9ydHMgPSBuZXcgTWFwKClcclxuICAgICAgICAgICAgZXhwb3J0TGlzdC5zZXQodmFsdWUsIGV4cG9ydHMpXHJcbiAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgaWYgKHR5cGVvZiBjdXJyZW50RXhwb3J0ICE9PSAndW5kZWZpbmVkJykge1xyXG4gICAgICAgICAgICBjdXJyZW50RXhwb3J0LndoZXJlVXNlZC5hZGQoZmlsZSlcclxuICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGNvbnN0IHdoZXJlVXNlZCA9IG5ldyBTZXQoKVxyXG4gICAgICAgICAgICB3aGVyZVVzZWQuYWRkKGZpbGUpXHJcbiAgICAgICAgICAgIGV4cG9ydHMuc2V0KElNUE9SVF9ERUZBVUxUX1NQRUNJRklFUiwgeyB3aGVyZVVzZWQgfSlcclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgIH0pXHJcblxyXG4gICAgICBvbGREZWZhdWx0SW1wb3J0cy5mb3JFYWNoKHZhbHVlID0+IHtcclxuICAgICAgICBpZiAoIW5ld0RlZmF1bHRJbXBvcnRzLmhhcyh2YWx1ZSkpIHtcclxuICAgICAgICAgIGNvbnN0IGltcG9ydHMgPSBvbGRJbXBvcnRQYXRocy5nZXQodmFsdWUpXHJcbiAgICAgICAgICBpbXBvcnRzLmRlbGV0ZShJTVBPUlRfREVGQVVMVF9TUEVDSUZJRVIpXHJcblxyXG4gICAgICAgICAgY29uc3QgZXhwb3J0cyA9IGV4cG9ydExpc3QuZ2V0KHZhbHVlKVxyXG4gICAgICAgICAgaWYgKHR5cGVvZiBleHBvcnRzICE9PSAndW5kZWZpbmVkJykge1xyXG4gICAgICAgICAgICBjb25zdCBjdXJyZW50RXhwb3J0ID0gZXhwb3J0cy5nZXQoSU1QT1JUX0RFRkFVTFRfU1BFQ0lGSUVSKVxyXG4gICAgICAgICAgICBpZiAodHlwZW9mIGN1cnJlbnRFeHBvcnQgIT09ICd1bmRlZmluZWQnKSB7XHJcbiAgICAgICAgICAgICAgY3VycmVudEV4cG9ydC53aGVyZVVzZWQuZGVsZXRlKGZpbGUpXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgIH0pXHJcblxyXG4gICAgICBuZXdOYW1lc3BhY2VJbXBvcnRzLmZvckVhY2godmFsdWUgPT4ge1xyXG4gICAgICAgIGlmICghb2xkTmFtZXNwYWNlSW1wb3J0cy5oYXModmFsdWUpKSB7XHJcbiAgICAgICAgICBsZXQgaW1wb3J0cyA9IG9sZEltcG9ydFBhdGhzLmdldCh2YWx1ZSlcclxuICAgICAgICAgIGlmICh0eXBlb2YgaW1wb3J0cyA9PT0gJ3VuZGVmaW5lZCcpIHtcclxuICAgICAgICAgICAgaW1wb3J0cyA9IG5ldyBTZXQoKVxyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgaW1wb3J0cy5hZGQoSU1QT1JUX05BTUVTUEFDRV9TUEVDSUZJRVIpXHJcbiAgICAgICAgICBvbGRJbXBvcnRQYXRocy5zZXQodmFsdWUsIGltcG9ydHMpXHJcblxyXG4gICAgICAgICAgbGV0IGV4cG9ydHMgPSBleHBvcnRMaXN0LmdldCh2YWx1ZSlcclxuICAgICAgICAgIGxldCBjdXJyZW50RXhwb3J0XHJcbiAgICAgICAgICBpZiAodHlwZW9mIGV4cG9ydHMgIT09ICd1bmRlZmluZWQnKSB7XHJcbiAgICAgICAgICAgIGN1cnJlbnRFeHBvcnQgPSBleHBvcnRzLmdldChJTVBPUlRfTkFNRVNQQUNFX1NQRUNJRklFUilcclxuICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGV4cG9ydHMgPSBuZXcgTWFwKClcclxuICAgICAgICAgICAgZXhwb3J0TGlzdC5zZXQodmFsdWUsIGV4cG9ydHMpXHJcbiAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgaWYgKHR5cGVvZiBjdXJyZW50RXhwb3J0ICE9PSAndW5kZWZpbmVkJykge1xyXG4gICAgICAgICAgICBjdXJyZW50RXhwb3J0LndoZXJlVXNlZC5hZGQoZmlsZSlcclxuICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGNvbnN0IHdoZXJlVXNlZCA9IG5ldyBTZXQoKVxyXG4gICAgICAgICAgICB3aGVyZVVzZWQuYWRkKGZpbGUpXHJcbiAgICAgICAgICAgIGV4cG9ydHMuc2V0KElNUE9SVF9OQU1FU1BBQ0VfU1BFQ0lGSUVSLCB7IHdoZXJlVXNlZCB9KVxyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgfSlcclxuXHJcbiAgICAgIG9sZE5hbWVzcGFjZUltcG9ydHMuZm9yRWFjaCh2YWx1ZSA9PiB7XHJcbiAgICAgICAgaWYgKCFuZXdOYW1lc3BhY2VJbXBvcnRzLmhhcyh2YWx1ZSkpIHtcclxuICAgICAgICAgIGNvbnN0IGltcG9ydHMgPSBvbGRJbXBvcnRQYXRocy5nZXQodmFsdWUpXHJcbiAgICAgICAgICBpbXBvcnRzLmRlbGV0ZShJTVBPUlRfTkFNRVNQQUNFX1NQRUNJRklFUilcclxuXHJcbiAgICAgICAgICBjb25zdCBleHBvcnRzID0gZXhwb3J0TGlzdC5nZXQodmFsdWUpXHJcbiAgICAgICAgICBpZiAodHlwZW9mIGV4cG9ydHMgIT09ICd1bmRlZmluZWQnKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IGN1cnJlbnRFeHBvcnQgPSBleHBvcnRzLmdldChJTVBPUlRfTkFNRVNQQUNFX1NQRUNJRklFUilcclxuICAgICAgICAgICAgaWYgKHR5cGVvZiBjdXJyZW50RXhwb3J0ICE9PSAndW5kZWZpbmVkJykge1xyXG4gICAgICAgICAgICAgIGN1cnJlbnRFeHBvcnQud2hlcmVVc2VkLmRlbGV0ZShmaWxlKVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICB9KVxyXG5cclxuICAgICAgbmV3SW1wb3J0cy5mb3JFYWNoKCh2YWx1ZSwga2V5KSA9PiB7XHJcbiAgICAgICAgaWYgKCFvbGRJbXBvcnRzLmhhcyhrZXkpKSB7XHJcbiAgICAgICAgICBsZXQgaW1wb3J0cyA9IG9sZEltcG9ydFBhdGhzLmdldCh2YWx1ZSlcclxuICAgICAgICAgIGlmICh0eXBlb2YgaW1wb3J0cyA9PT0gJ3VuZGVmaW5lZCcpIHtcclxuICAgICAgICAgICAgaW1wb3J0cyA9IG5ldyBTZXQoKVxyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgaW1wb3J0cy5hZGQoa2V5KVxyXG4gICAgICAgICAgb2xkSW1wb3J0UGF0aHMuc2V0KHZhbHVlLCBpbXBvcnRzKVxyXG5cclxuICAgICAgICAgIGxldCBleHBvcnRzID0gZXhwb3J0TGlzdC5nZXQodmFsdWUpXHJcbiAgICAgICAgICBsZXQgY3VycmVudEV4cG9ydFxyXG4gICAgICAgICAgaWYgKHR5cGVvZiBleHBvcnRzICE9PSAndW5kZWZpbmVkJykge1xyXG4gICAgICAgICAgICBjdXJyZW50RXhwb3J0ID0gZXhwb3J0cy5nZXQoa2V5KVxyXG4gICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgZXhwb3J0cyA9IG5ldyBNYXAoKVxyXG4gICAgICAgICAgICBleHBvcnRMaXN0LnNldCh2YWx1ZSwgZXhwb3J0cylcclxuICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICBpZiAodHlwZW9mIGN1cnJlbnRFeHBvcnQgIT09ICd1bmRlZmluZWQnKSB7XHJcbiAgICAgICAgICAgIGN1cnJlbnRFeHBvcnQud2hlcmVVc2VkLmFkZChmaWxlKVxyXG4gICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgY29uc3Qgd2hlcmVVc2VkID0gbmV3IFNldCgpXHJcbiAgICAgICAgICAgIHdoZXJlVXNlZC5hZGQoZmlsZSlcclxuICAgICAgICAgICAgZXhwb3J0cy5zZXQoa2V5LCB7IHdoZXJlVXNlZCB9KVxyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgfSlcclxuXHJcbiAgICAgIG9sZEltcG9ydHMuZm9yRWFjaCgodmFsdWUsIGtleSkgPT4ge1xyXG4gICAgICAgIGlmICghbmV3SW1wb3J0cy5oYXMoa2V5KSkge1xyXG4gICAgICAgICAgY29uc3QgaW1wb3J0cyA9IG9sZEltcG9ydFBhdGhzLmdldCh2YWx1ZSlcclxuICAgICAgICAgIGltcG9ydHMuZGVsZXRlKGtleSlcclxuXHJcbiAgICAgICAgICBjb25zdCBleHBvcnRzID0gZXhwb3J0TGlzdC5nZXQodmFsdWUpXHJcbiAgICAgICAgICBpZiAodHlwZW9mIGV4cG9ydHMgIT09ICd1bmRlZmluZWQnKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IGN1cnJlbnRFeHBvcnQgPSBleHBvcnRzLmdldChrZXkpXHJcbiAgICAgICAgICAgIGlmICh0eXBlb2YgY3VycmVudEV4cG9ydCAhPT0gJ3VuZGVmaW5lZCcpIHtcclxuICAgICAgICAgICAgICBjdXJyZW50RXhwb3J0LndoZXJlVXNlZC5kZWxldGUoZmlsZSlcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgfSlcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4ge1xyXG4gICAgICAnUHJvZ3JhbTpleGl0Jzogbm9kZSA9PiB7XHJcbiAgICAgICAgdXBkYXRlRXhwb3J0VXNhZ2Uobm9kZSlcclxuICAgICAgICB1cGRhdGVJbXBvcnRVc2FnZShub2RlKVxyXG4gICAgICAgIGNoZWNrRXhwb3J0UHJlc2VuY2Uobm9kZSlcclxuICAgICAgfSxcclxuICAgICAgJ0V4cG9ydERlZmF1bHREZWNsYXJhdGlvbic6IG5vZGUgPT4ge1xyXG4gICAgICAgIGNoZWNrVXNhZ2Uobm9kZSwgSU1QT1JUX0RFRkFVTFRfU1BFQ0lGSUVSKVxyXG4gICAgICB9LFxyXG4gICAgICAnRXhwb3J0TmFtZWREZWNsYXJhdGlvbic6IG5vZGUgPT4ge1xyXG4gICAgICAgIG5vZGUuc3BlY2lmaWVycy5mb3JFYWNoKHNwZWNpZmllciA9PiB7XHJcbiAgICAgICAgICAgIGNoZWNrVXNhZ2Uobm9kZSwgc3BlY2lmaWVyLmV4cG9ydGVkLm5hbWUpXHJcbiAgICAgICAgfSlcclxuICAgICAgICBpZiAobm9kZS5kZWNsYXJhdGlvbikge1xyXG4gICAgICAgICAgaWYgKFxyXG4gICAgICAgICAgICBub2RlLmRlY2xhcmF0aW9uLnR5cGUgPT09IEZVTkNUSU9OX0RFQ0xBUkFUSU9OIHx8XHJcbiAgICAgICAgICAgIG5vZGUuZGVjbGFyYXRpb24udHlwZSA9PT0gQ0xBU1NfREVDTEFSQVRJT05cclxuICAgICAgICAgICkge1xyXG4gICAgICAgICAgICBjaGVja1VzYWdlKG5vZGUsIG5vZGUuZGVjbGFyYXRpb24uaWQubmFtZSlcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIGlmIChub2RlLmRlY2xhcmF0aW9uLnR5cGUgPT09IFZBUklBQkxFX0RFQ0xBUkFUSU9OKSB7XHJcbiAgICAgICAgICAgIG5vZGUuZGVjbGFyYXRpb24uZGVjbGFyYXRpb25zLmZvckVhY2goZGVjbGFyYXRpb24gPT4ge1xyXG4gICAgICAgICAgICAgIGNoZWNrVXNhZ2Uobm9kZSwgZGVjbGFyYXRpb24uaWQubmFtZSlcclxuICAgICAgICAgICAgfSlcclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgIH0sXHJcbiAgICB9XHJcbiAgfSxcclxufVxyXG4iXX0=