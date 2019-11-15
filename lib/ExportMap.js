'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.recursivePatternCapture = recursivePatternCapture;

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _doctrine = require('doctrine');

var _doctrine2 = _interopRequireDefault(_doctrine);

var _debug = require('debug');

var _debug2 = _interopRequireDefault(_debug);

var _eslint = require('eslint');

var _parse = require('eslint-module-utils/parse');

var _parse2 = _interopRequireDefault(_parse);

var _resolve = require('eslint-module-utils/resolve');

var _resolve2 = _interopRequireDefault(_resolve);

var _ignore = require('eslint-module-utils/ignore');

var _ignore2 = _interopRequireDefault(_ignore);

var _hash = require('eslint-module-utils/hash');

var _unambiguous = require('eslint-module-utils/unambiguous');

var unambiguous = _interopRequireWildcard(_unambiguous);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const log = (0, _debug2.default)('eslint-plugin-import:ExportMap');

const exportCache = new Map();

class ExportMap {
  constructor(path) {
    this.path = path;
    this.namespace = new Map();
    // todo: restructure to key on path, value is resolver + map of names
    this.reexports = new Map();
    /**
     * star-exports
     * @type {Set} of () => ExportMap
     */
    this.dependencies = new Set();
    /**
     * dependencies of this module that are not explicitly re-exported
     * @type {Map} from path = () => ExportMap
     */
    this.imports = new Map();
    this.errors = [];
  }

  get hasDefault() {
    return this.get('default') != null;
  } // stronger than this.has

  get size() {
    let size = this.namespace.size + this.reexports.size;
    this.dependencies.forEach(dep => {
      const d = dep();
      // CJS / ignored dependencies won't exist (#717)
      if (d == null) return;
      size += d.size;
    });
    return size;
  }

  /**
   * Note that this does not check explicitly re-exported names for existence
   * in the base namespace, but it will expand all `export * from '...'` exports
   * if not found in the explicit namespace.
   * @param  {string}  name
   * @return {Boolean} true if `name` is exported by this module.
   */
  has(name) {
    if (this.namespace.has(name)) return true;
    if (this.reexports.has(name)) return true;

    // default exports must be explicitly re-exported (#328)
    if (name !== 'default') {
      for (let dep of this.dependencies) {
        let innerMap = dep();

        // todo: report as unresolved?
        if (!innerMap) continue;

        if (innerMap.has(name)) return true;
      }
    }

    return false;
  }

  /**
   * ensure that imported name fully resolves.
   * @param  {[type]}  name [description]
   * @return {Boolean}      [description]
   */
  hasDeep(name) {
    if (this.namespace.has(name)) return { found: true, path: [this] };

    if (this.reexports.has(name)) {
      const reexports = this.reexports.get(name),
            imported = reexports.getImport();

      // if import is ignored, return explicit 'null'
      if (imported == null) return { found: true, path: [this]

        // safeguard against cycles, only if name matches
      };if (imported.path === this.path && reexports.local === name) {
        return { found: false, path: [this] };
      }

      const deep = imported.hasDeep(reexports.local);
      deep.path.unshift(this);

      return deep;
    }

    // default exports must be explicitly re-exported (#328)
    if (name !== 'default') {
      for (let dep of this.dependencies) {
        let innerMap = dep();
        // todo: report as unresolved?
        if (!innerMap) continue;

        // safeguard against cycles
        if (innerMap.path === this.path) continue;

        let innerValue = innerMap.hasDeep(name);
        if (innerValue.found) {
          innerValue.path.unshift(this);
          return innerValue;
        }
      }
    }

    return { found: false, path: [this] };
  }

  get(name) {
    if (this.namespace.has(name)) return this.namespace.get(name);

    if (this.reexports.has(name)) {
      const reexports = this.reexports.get(name),
            imported = reexports.getImport();

      // if import is ignored, return explicit 'null'
      if (imported == null) return null;

      // safeguard against cycles, only if name matches
      if (imported.path === this.path && reexports.local === name) return undefined;

      return imported.get(reexports.local);
    }

    // default exports must be explicitly re-exported (#328)
    if (name !== 'default') {
      for (let dep of this.dependencies) {
        let innerMap = dep();
        // todo: report as unresolved?
        if (!innerMap) continue;

        // safeguard against cycles
        if (innerMap.path === this.path) continue;

        let innerValue = innerMap.get(name);
        if (innerValue !== undefined) return innerValue;
      }
    }

    return undefined;
  }

  forEach(callback, thisArg) {
    this.namespace.forEach((v, n) => callback.call(thisArg, v, n, this));

    this.reexports.forEach((reexports, name) => {
      const reexported = reexports.getImport();
      // can't look up meta for ignored re-exports (#348)
      callback.call(thisArg, reexported && reexported.get(reexports.local), name, this);
    });

    this.dependencies.forEach(dep => {
      const d = dep();
      // CJS / ignored dependencies won't exist (#717)
      if (d == null) return;

      d.forEach((v, n) => n !== 'default' && callback.call(thisArg, v, n, this));
    });
  }

  // todo: keys, values, entries?

  reportErrors(context, declaration) {
    context.report({
      node: declaration.source,
      message: `Parse errors in imported module '${declaration.source.value}': ` + `${this.errors.map(e => `${e.message} (${e.lineNumber}:${e.column})`).join(', ')}`
    });
  }
}

exports.default = ExportMap; /**
                              * parse docs from the first node that has leading comments
                              */

function captureDoc(source, docStyleParsers) {
  const metadata = {};

  // 'some' short-circuits on first 'true'

  for (var _len = arguments.length, nodes = Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
    nodes[_key - 2] = arguments[_key];
  }

  nodes.some(n => {
    try {

      let leadingComments;

      // n.leadingComments is legacy `attachComments` behavior
      if ('leadingComments' in n) {
        leadingComments = n.leadingComments;
      } else if (n.range) {
        leadingComments = source.getCommentsBefore(n);
      }

      if (!leadingComments || leadingComments.length === 0) return false;

      for (let name in docStyleParsers) {
        const doc = docStyleParsers[name](leadingComments);
        if (doc) {
          metadata.doc = doc;
        }
      }

      return true;
    } catch (err) {
      return false;
    }
  });

  return metadata;
}

const availableDocStyleParsers = {
  jsdoc: captureJsDoc,
  tomdoc: captureTomDoc

  /**
   * parse JSDoc from leading comments
   * @param  {...[type]} comments [description]
   * @return {{doc: object}}
   */
};function captureJsDoc(comments) {
  let doc;

  // capture XSDoc
  comments.forEach(comment => {
    // skip non-block comments
    if (comment.type !== 'Block') return;
    try {
      doc = _doctrine2.default.parse(comment.value, { unwrap: true });
    } catch (err) {
      /* don't care, for now? maybe add to `errors?` */
    }
  });

  return doc;
}

/**
  * parse TomDoc section from comments
  */
function captureTomDoc(comments) {
  // collect lines up to first paragraph break
  const lines = [];
  for (let i = 0; i < comments.length; i++) {
    const comment = comments[i];
    if (comment.value.match(/^\s*$/)) break;
    lines.push(comment.value.trim());
  }

  // return doctrine-like object
  const statusMatch = lines.join(' ').match(/^(Public|Internal|Deprecated):\s*(.+)/);
  if (statusMatch) {
    return {
      description: statusMatch[2],
      tags: [{
        title: statusMatch[1].toLowerCase(),
        description: statusMatch[2]
      }]
    };
  }
}

ExportMap.get = function (source, context) {
  const path = (0, _resolve2.default)(source, context);
  if (path == null) return null;

  return ExportMap.for(childContext(path, context));
};

ExportMap.for = function (context) {
  const path = context.path;


  const cacheKey = (0, _hash.hashObject)(context).digest('hex');
  let exportMap = exportCache.get(cacheKey);

  // return cached ignore
  if (exportMap === null) return null;

  const stats = _fs2.default.statSync(path);
  if (exportMap != null) {
    // date equality check
    if (exportMap.mtime - stats.mtime === 0) {
      return exportMap;
    }
    // future: check content equality?
  }

  // check valid extensions first
  if (!(0, _ignore.hasValidExtension)(path, context)) {
    exportCache.set(cacheKey, null);
    return null;
  }

  const content = _fs2.default.readFileSync(path, { encoding: 'utf8' });

  // check for and cache ignore
  if ((0, _ignore2.default)(path, context) || !unambiguous.test(content)) {
    log('ignored path due to unambiguous regex or ignore settings:', path);
    exportCache.set(cacheKey, null);
    return null;
  }

  log('cache miss', cacheKey, 'for path', path);
  exportMap = ExportMap.parse(path, content, context);

  // ambiguous modules return null
  if (exportMap == null) return null;

  exportMap.mtime = stats.mtime;

  exportCache.set(cacheKey, exportMap);
  return exportMap;
};

ExportMap.parse = function (path, content, context) {
  var m = new ExportMap(path);

  try {
    var ast = (0, _parse2.default)(path, content, context);
  } catch (err) {
    log('parse error:', path, err);
    m.errors.push(err);
    return m; // can't continue
  }

  if (!unambiguous.isModule(ast)) return null;

  const docstyle = context.settings && context.settings['import/docstyle'] || ['jsdoc'];
  const docStyleParsers = {};
  docstyle.forEach(style => {
    docStyleParsers[style] = availableDocStyleParsers[style];
  });

  // attempt to collect module doc
  if (ast.comments) {
    ast.comments.some(c => {
      if (c.type !== 'Block') return false;
      try {
        const doc = _doctrine2.default.parse(c.value, { unwrap: true });
        if (doc.tags.some(t => t.title === 'module')) {
          m.doc = doc;
          return true;
        }
      } catch (err) {/* ignore */}
      return false;
    });
  }

  const namespaces = new Map();

  function remotePath(value) {
    return _resolve2.default.relative(value, path, context.settings);
  }

  function resolveImport(value) {
    const rp = remotePath(value);
    if (rp == null) return null;
    return ExportMap.for(childContext(rp, context));
  }

  function getNamespace(identifier) {
    if (!namespaces.has(identifier.name)) return;

    return function () {
      return resolveImport(namespaces.get(identifier.name));
    };
  }

  function addNamespace(object, identifier) {
    const nsfn = getNamespace(identifier);
    if (nsfn) {
      Object.defineProperty(object, 'namespace', { get: nsfn });
    }

    return object;
  }

  function captureDependency(declaration) {
    if (declaration.source == null) return null;
    const importedSpecifiers = new Set();
    const supportedTypes = new Set(['ImportDefaultSpecifier', 'ImportNamespaceSpecifier']);
    if (declaration.specifiers) {
      declaration.specifiers.forEach(specifier => {
        if (supportedTypes.has(specifier.type)) {
          importedSpecifiers.add(specifier.type);
        }
        if (specifier.type === 'ImportSpecifier') {
          importedSpecifiers.add(specifier.imported.name);
        }
      });
    }

    const p = remotePath(declaration.source.value);
    if (p == null) return null;
    const existing = m.imports.get(p);
    if (existing != null) return existing.getter;

    const getter = thunkFor(p, context);
    m.imports.set(p, {
      getter,
      source: { // capturing actual node reference holds full AST in memory!
        value: declaration.source.value,
        loc: declaration.source.loc
      },
      importedSpecifiers
    });
    return getter;
  }

  const source = makeSourceCode(content, ast);

  ast.body.forEach(function (n) {

    if (n.type === 'ExportDefaultDeclaration') {
      const exportMeta = captureDoc(source, docStyleParsers, n);
      if (n.declaration.type === 'Identifier') {
        addNamespace(exportMeta, n.declaration);
      }
      m.namespace.set('default', exportMeta);
      return;
    }

    if (n.type === 'ExportAllDeclaration') {
      const getter = captureDependency(n);
      if (getter) m.dependencies.add(getter);
      return;
    }

    // capture namespaces in case of later export
    if (n.type === 'ImportDeclaration') {
      captureDependency(n);
      let ns;
      if (n.specifiers.some(s => s.type === 'ImportNamespaceSpecifier' && (ns = s))) {
        namespaces.set(ns.local.name, n.source.value);
      }
      return;
    }

    if (n.type === 'ExportNamedDeclaration') {
      // capture declaration
      if (n.declaration != null) {
        switch (n.declaration.type) {
          case 'FunctionDeclaration':
          case 'ClassDeclaration':
          case 'TypeAlias': // flowtype with babel-eslint parser
          case 'InterfaceDeclaration':
          case 'DeclareFunction':
          case 'TSDeclareFunction':
          case 'TSEnumDeclaration':
          case 'TSTypeAliasDeclaration':
          case 'TSInterfaceDeclaration':
          case 'TSAbstractClassDeclaration':
          case 'TSModuleDeclaration':
            m.namespace.set(n.declaration.id.name, captureDoc(source, docStyleParsers, n));
            break;
          case 'VariableDeclaration':
            n.declaration.declarations.forEach(d => recursivePatternCapture(d.id, id => m.namespace.set(id.name, captureDoc(source, docStyleParsers, d, n))));
            break;
        }
      }

      const nsource = n.source && n.source.value;
      n.specifiers.forEach(s => {
        const exportMeta = {};
        let local;

        switch (s.type) {
          case 'ExportDefaultSpecifier':
            if (!n.source) return;
            local = 'default';
            break;
          case 'ExportNamespaceSpecifier':
            m.namespace.set(s.exported.name, Object.defineProperty(exportMeta, 'namespace', {
              get() {
                return resolveImport(nsource);
              }
            }));
            return;
          case 'ExportSpecifier':
            if (!n.source) {
              m.namespace.set(s.exported.name, addNamespace(exportMeta, s.local));
              return;
            }
          // else falls through
          default:
            local = s.local.name;
            break;
        }

        // todo: JSDoc
        m.reexports.set(s.exported.name, { local, getImport: () => resolveImport(nsource) });
      });
    }

    // This doesn't declare anything, but changes what's being exported.
    if (n.type === 'TSExportAssignment') {
      const moduleDecl = ast.body.find(bodyNode => bodyNode.type === 'TSModuleDeclaration' && bodyNode.id.name === n.expression.name);
      if (moduleDecl && moduleDecl.body && moduleDecl.body.body) {
        moduleDecl.body.body.forEach(moduleBlockNode => {
          // Export-assignment exports all members in the namespace, explicitly exported or not.
          const exportedDecl = moduleBlockNode.type === 'ExportNamedDeclaration' ? moduleBlockNode.declaration : moduleBlockNode;

          if (exportedDecl.type === 'VariableDeclaration') {
            exportedDecl.declarations.forEach(decl => recursivePatternCapture(decl.id, id => m.namespace.set(id.name, captureDoc(source, docStyleParsers, decl, exportedDecl, moduleBlockNode))));
          } else {
            m.namespace.set(exportedDecl.id.name, captureDoc(source, docStyleParsers, moduleBlockNode));
          }
        });
      }
    }
  });

  return m;
};

/**
 * The creation of this closure is isolated from other scopes
 * to avoid over-retention of unrelated variables, which has
 * caused memory leaks. See #1266.
 */
function thunkFor(p, context) {
  return () => ExportMap.for(childContext(p, context));
}

/**
 * Traverse a pattern/identifier node, calling 'callback'
 * for each leaf identifier.
 * @param  {node}   pattern
 * @param  {Function} callback
 * @return {void}
 */
function recursivePatternCapture(pattern, callback) {
  switch (pattern.type) {
    case 'Identifier':
      // base case
      callback(pattern);
      break;

    case 'ObjectPattern':
      pattern.properties.forEach(p => {
        recursivePatternCapture(p.value, callback);
      });
      break;

    case 'ArrayPattern':
      pattern.elements.forEach(element => {
        if (element == null) return;
        recursivePatternCapture(element, callback);
      });
      break;

    case 'AssignmentPattern':
      callback(pattern.left);
      break;
  }
}

/**
 * don't hold full context object in memory, just grab what we need.
 */
function childContext(path, context) {
  const settings = context.settings,
        parserOptions = context.parserOptions,
        parserPath = context.parserPath;

  return {
    settings,
    parserOptions,
    parserPath,
    path
  };
}

/**
 * sometimes legacy support isn't _that_ hard... right?
 */
function makeSourceCode(text, ast) {
  if (_eslint.SourceCode.length > 1) {
    // ESLint 3
    return new _eslint.SourceCode(text, ast);
  } else {
    // ESLint 4, 5
    return new _eslint.SourceCode({ text, ast });
  }
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9FeHBvcnRNYXAuanMiXSwibmFtZXMiOlsicmVjdXJzaXZlUGF0dGVybkNhcHR1cmUiLCJ1bmFtYmlndW91cyIsImxvZyIsImV4cG9ydENhY2hlIiwiTWFwIiwiRXhwb3J0TWFwIiwiY29uc3RydWN0b3IiLCJwYXRoIiwibmFtZXNwYWNlIiwicmVleHBvcnRzIiwiZGVwZW5kZW5jaWVzIiwiU2V0IiwiaW1wb3J0cyIsImVycm9ycyIsImhhc0RlZmF1bHQiLCJnZXQiLCJzaXplIiwiZm9yRWFjaCIsImRlcCIsImQiLCJoYXMiLCJuYW1lIiwiaW5uZXJNYXAiLCJoYXNEZWVwIiwiZm91bmQiLCJpbXBvcnRlZCIsImdldEltcG9ydCIsImxvY2FsIiwiZGVlcCIsInVuc2hpZnQiLCJpbm5lclZhbHVlIiwidW5kZWZpbmVkIiwiY2FsbGJhY2siLCJ0aGlzQXJnIiwidiIsIm4iLCJjYWxsIiwicmVleHBvcnRlZCIsInJlcG9ydEVycm9ycyIsImNvbnRleHQiLCJkZWNsYXJhdGlvbiIsInJlcG9ydCIsIm5vZGUiLCJzb3VyY2UiLCJtZXNzYWdlIiwidmFsdWUiLCJtYXAiLCJlIiwibGluZU51bWJlciIsImNvbHVtbiIsImpvaW4iLCJjYXB0dXJlRG9jIiwiZG9jU3R5bGVQYXJzZXJzIiwibWV0YWRhdGEiLCJub2RlcyIsInNvbWUiLCJsZWFkaW5nQ29tbWVudHMiLCJyYW5nZSIsImdldENvbW1lbnRzQmVmb3JlIiwibGVuZ3RoIiwiZG9jIiwiZXJyIiwiYXZhaWxhYmxlRG9jU3R5bGVQYXJzZXJzIiwianNkb2MiLCJjYXB0dXJlSnNEb2MiLCJ0b21kb2MiLCJjYXB0dXJlVG9tRG9jIiwiY29tbWVudHMiLCJjb21tZW50IiwidHlwZSIsImRvY3RyaW5lIiwicGFyc2UiLCJ1bndyYXAiLCJsaW5lcyIsImkiLCJtYXRjaCIsInB1c2giLCJ0cmltIiwic3RhdHVzTWF0Y2giLCJkZXNjcmlwdGlvbiIsInRhZ3MiLCJ0aXRsZSIsInRvTG93ZXJDYXNlIiwiZm9yIiwiY2hpbGRDb250ZXh0IiwiY2FjaGVLZXkiLCJkaWdlc3QiLCJleHBvcnRNYXAiLCJzdGF0cyIsImZzIiwic3RhdFN5bmMiLCJtdGltZSIsInNldCIsImNvbnRlbnQiLCJyZWFkRmlsZVN5bmMiLCJlbmNvZGluZyIsInRlc3QiLCJtIiwiYXN0IiwiaXNNb2R1bGUiLCJkb2NzdHlsZSIsInNldHRpbmdzIiwic3R5bGUiLCJjIiwidCIsIm5hbWVzcGFjZXMiLCJyZW1vdGVQYXRoIiwicmVzb2x2ZSIsInJlbGF0aXZlIiwicmVzb2x2ZUltcG9ydCIsInJwIiwiZ2V0TmFtZXNwYWNlIiwiaWRlbnRpZmllciIsImFkZE5hbWVzcGFjZSIsIm9iamVjdCIsIm5zZm4iLCJPYmplY3QiLCJkZWZpbmVQcm9wZXJ0eSIsImNhcHR1cmVEZXBlbmRlbmN5IiwiaW1wb3J0ZWRTcGVjaWZpZXJzIiwic3VwcG9ydGVkVHlwZXMiLCJzcGVjaWZpZXJzIiwic3BlY2lmaWVyIiwiYWRkIiwicCIsImV4aXN0aW5nIiwiZ2V0dGVyIiwidGh1bmtGb3IiLCJsb2MiLCJtYWtlU291cmNlQ29kZSIsImJvZHkiLCJleHBvcnRNZXRhIiwibnMiLCJzIiwiaWQiLCJkZWNsYXJhdGlvbnMiLCJuc291cmNlIiwiZXhwb3J0ZWQiLCJtb2R1bGVEZWNsIiwiZmluZCIsImJvZHlOb2RlIiwiZXhwcmVzc2lvbiIsIm1vZHVsZUJsb2NrTm9kZSIsImV4cG9ydGVkRGVjbCIsImRlY2wiLCJwYXR0ZXJuIiwicHJvcGVydGllcyIsImVsZW1lbnRzIiwiZWxlbWVudCIsImxlZnQiLCJwYXJzZXJPcHRpb25zIiwicGFyc2VyUGF0aCIsInRleHQiLCJTb3VyY2VDb2RlIl0sIm1hcHBpbmdzIjoiOzs7OztRQW1qQmdCQSx1QixHQUFBQSx1Qjs7QUFuakJoQjs7OztBQUVBOzs7O0FBRUE7Ozs7QUFFQTs7QUFFQTs7OztBQUNBOzs7O0FBQ0E7Ozs7QUFFQTs7QUFDQTs7SUFBWUMsVzs7Ozs7O0FBRVosTUFBTUMsTUFBTSxxQkFBTSxnQ0FBTixDQUFaOztB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O0FBR0Q7OztBQUdBLFNBQVMwSCxjQUFULENBQXdCdUIsSUFBeEIsRUFBOEJ0RCxHQUE5QixFQUFtQztBQUNqQyxNQUFJdUQsbUJBQVc5RixNQUFYLEdBQW9CLENBQXhCLEVBQTJCO0FBQ3pCO0FBQ0EsV0FBTyxJQUFJOEYsa0JBQUosQ0FBZUQsSUFBZixFQUFxQnRELEdBQXJCLENBQVA7QUFDRCxHQUhELE1BR087QUFDTDtBQUNBLFdBQU8sSUFBSXVELGtCQUFKLENBQWUsRUFBRUQsSUFBRixFQUFRdEQsR0FBUixFQUFmLENBQVA7QUFDRDtBQUNGIiwiZmlsZSI6IkV4cG9ydE1hcC5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBmcyBmcm9tICdmcydcclxuXHJcbmltcG9ydCBkb2N0cmluZSBmcm9tICdkb2N0cmluZSdcclxuXHJcbmltcG9ydCBkZWJ1ZyBmcm9tICdkZWJ1ZydcclxuXHJcbmltcG9ydCB7IFNvdXJjZUNvZGUgfSBmcm9tICdlc2xpbnQnXHJcblxyXG5pbXBvcnQgcGFyc2UgZnJvbSAnZXNsaW50LW1vZHVsZS11dGlscy9wYXJzZSdcclxuaW1wb3J0IHJlc29sdmUgZnJvbSAnZXNsaW50LW1vZHVsZS11dGlscy9yZXNvbHZlJ1xyXG5pbXBvcnQgaXNJZ25vcmVkLCB7IGhhc1ZhbGlkRXh0ZW5zaW9uIH0gZnJvbSAnZXNsaW50LW1vZHVsZS11dGlscy9pZ25vcmUnXHJcblxyXG5pbXBvcnQgeyBoYXNoT2JqZWN0IH0gZnJvbSAnZXNsaW50LW1vZHVsZS11dGlscy9oYXNoJ1xyXG5pbXBvcnQgKiBhcyB1bmFtYmlndW91cyBmcm9tICdlc2xpbnQtbW9kdWxlLXV0aWxzL3VuYW1iaWd1b3VzJ1xyXG5cclxuY29uc3QgbG9nID0gZGVidWcoJ2VzbGludC1wbHVnaW4taW1wb3J0OkV4cG9ydE1hcCcpXHJcblxyXG5jb25zdCBleHBvcnRDYWNoZSA9IG5ldyBNYXAoKVxyXG5cclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgRXhwb3J0TWFwIHtcclxuICBjb25zdHJ1Y3RvcihwYXRoKSB7XHJcbiAgICB0aGlzLnBhdGggPSBwYXRoXHJcbiAgICB0aGlzLm5hbWVzcGFjZSA9IG5ldyBNYXAoKVxyXG4gICAgLy8gdG9kbzogcmVzdHJ1Y3R1cmUgdG8ga2V5IG9uIHBhdGgsIHZhbHVlIGlzIHJlc29sdmVyICsgbWFwIG9mIG5hbWVzXHJcbiAgICB0aGlzLnJlZXhwb3J0cyA9IG5ldyBNYXAoKVxyXG4gICAgLyoqXHJcbiAgICAgKiBzdGFyLWV4cG9ydHNcclxuICAgICAqIEB0eXBlIHtTZXR9IG9mICgpID0+IEV4cG9ydE1hcFxyXG4gICAgICovXHJcbiAgICB0aGlzLmRlcGVuZGVuY2llcyA9IG5ldyBTZXQoKVxyXG4gICAgLyoqXHJcbiAgICAgKiBkZXBlbmRlbmNpZXMgb2YgdGhpcyBtb2R1bGUgdGhhdCBhcmUgbm90IGV4cGxpY2l0bHkgcmUtZXhwb3J0ZWRcclxuICAgICAqIEB0eXBlIHtNYXB9IGZyb20gcGF0aCA9ICgpID0+IEV4cG9ydE1hcFxyXG4gICAgICovXHJcbiAgICB0aGlzLmltcG9ydHMgPSBuZXcgTWFwKClcclxuICAgIHRoaXMuZXJyb3JzID0gW11cclxuICB9XHJcblxyXG4gIGdldCBoYXNEZWZhdWx0KCkgeyByZXR1cm4gdGhpcy5nZXQoJ2RlZmF1bHQnKSAhPSBudWxsIH0gLy8gc3Ryb25nZXIgdGhhbiB0aGlzLmhhc1xyXG5cclxuICBnZXQgc2l6ZSgpIHtcclxuICAgIGxldCBzaXplID0gdGhpcy5uYW1lc3BhY2Uuc2l6ZSArIHRoaXMucmVleHBvcnRzLnNpemVcclxuICAgIHRoaXMuZGVwZW5kZW5jaWVzLmZvckVhY2goZGVwID0+IHtcclxuICAgICAgY29uc3QgZCA9IGRlcCgpXHJcbiAgICAgIC8vIENKUyAvIGlnbm9yZWQgZGVwZW5kZW5jaWVzIHdvbid0IGV4aXN0ICgjNzE3KVxyXG4gICAgICBpZiAoZCA9PSBudWxsKSByZXR1cm5cclxuICAgICAgc2l6ZSArPSBkLnNpemVcclxuICAgIH0pXHJcbiAgICByZXR1cm4gc2l6ZVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogTm90ZSB0aGF0IHRoaXMgZG9lcyBub3QgY2hlY2sgZXhwbGljaXRseSByZS1leHBvcnRlZCBuYW1lcyBmb3IgZXhpc3RlbmNlXHJcbiAgICogaW4gdGhlIGJhc2UgbmFtZXNwYWNlLCBidXQgaXQgd2lsbCBleHBhbmQgYWxsIGBleHBvcnQgKiBmcm9tICcuLi4nYCBleHBvcnRzXHJcbiAgICogaWYgbm90IGZvdW5kIGluIHRoZSBleHBsaWNpdCBuYW1lc3BhY2UuXHJcbiAgICogQHBhcmFtICB7c3RyaW5nfSAgbmFtZVxyXG4gICAqIEByZXR1cm4ge0Jvb2xlYW59IHRydWUgaWYgYG5hbWVgIGlzIGV4cG9ydGVkIGJ5IHRoaXMgbW9kdWxlLlxyXG4gICAqL1xyXG4gIGhhcyhuYW1lKSB7XHJcbiAgICBpZiAodGhpcy5uYW1lc3BhY2UuaGFzKG5hbWUpKSByZXR1cm4gdHJ1ZVxyXG4gICAgaWYgKHRoaXMucmVleHBvcnRzLmhhcyhuYW1lKSkgcmV0dXJuIHRydWVcclxuXHJcbiAgICAvLyBkZWZhdWx0IGV4cG9ydHMgbXVzdCBiZSBleHBsaWNpdGx5IHJlLWV4cG9ydGVkICgjMzI4KVxyXG4gICAgaWYgKG5hbWUgIT09ICdkZWZhdWx0Jykge1xyXG4gICAgICBmb3IgKGxldCBkZXAgb2YgdGhpcy5kZXBlbmRlbmNpZXMpIHtcclxuICAgICAgICBsZXQgaW5uZXJNYXAgPSBkZXAoKVxyXG5cclxuICAgICAgICAvLyB0b2RvOiByZXBvcnQgYXMgdW5yZXNvbHZlZD9cclxuICAgICAgICBpZiAoIWlubmVyTWFwKSBjb250aW51ZVxyXG5cclxuICAgICAgICBpZiAoaW5uZXJNYXAuaGFzKG5hbWUpKSByZXR1cm4gdHJ1ZVxyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIGZhbHNlXHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBlbnN1cmUgdGhhdCBpbXBvcnRlZCBuYW1lIGZ1bGx5IHJlc29sdmVzLlxyXG4gICAqIEBwYXJhbSAge1t0eXBlXX0gIG5hbWUgW2Rlc2NyaXB0aW9uXVxyXG4gICAqIEByZXR1cm4ge0Jvb2xlYW59ICAgICAgW2Rlc2NyaXB0aW9uXVxyXG4gICAqL1xyXG4gIGhhc0RlZXAobmFtZSkge1xyXG4gICAgaWYgKHRoaXMubmFtZXNwYWNlLmhhcyhuYW1lKSkgcmV0dXJuIHsgZm91bmQ6IHRydWUsIHBhdGg6IFt0aGlzXSB9XHJcblxyXG4gICAgaWYgKHRoaXMucmVleHBvcnRzLmhhcyhuYW1lKSkge1xyXG4gICAgICBjb25zdCByZWV4cG9ydHMgPSB0aGlzLnJlZXhwb3J0cy5nZXQobmFtZSlcclxuICAgICAgICAgICwgaW1wb3J0ZWQgPSByZWV4cG9ydHMuZ2V0SW1wb3J0KClcclxuXHJcbiAgICAgIC8vIGlmIGltcG9ydCBpcyBpZ25vcmVkLCByZXR1cm4gZXhwbGljaXQgJ251bGwnXHJcbiAgICAgIGlmIChpbXBvcnRlZCA9PSBudWxsKSByZXR1cm4geyBmb3VuZDogdHJ1ZSwgcGF0aDogW3RoaXNdIH1cclxuXHJcbiAgICAgIC8vIHNhZmVndWFyZCBhZ2FpbnN0IGN5Y2xlcywgb25seSBpZiBuYW1lIG1hdGNoZXNcclxuICAgICAgaWYgKGltcG9ydGVkLnBhdGggPT09IHRoaXMucGF0aCAmJiByZWV4cG9ydHMubG9jYWwgPT09IG5hbWUpIHtcclxuICAgICAgICByZXR1cm4geyBmb3VuZDogZmFsc2UsIHBhdGg6IFt0aGlzXSB9XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGNvbnN0IGRlZXAgPSBpbXBvcnRlZC5oYXNEZWVwKHJlZXhwb3J0cy5sb2NhbClcclxuICAgICAgZGVlcC5wYXRoLnVuc2hpZnQodGhpcylcclxuXHJcbiAgICAgIHJldHVybiBkZWVwXHJcbiAgICB9XHJcblxyXG5cclxuICAgIC8vIGRlZmF1bHQgZXhwb3J0cyBtdXN0IGJlIGV4cGxpY2l0bHkgcmUtZXhwb3J0ZWQgKCMzMjgpXHJcbiAgICBpZiAobmFtZSAhPT0gJ2RlZmF1bHQnKSB7XHJcbiAgICAgIGZvciAobGV0IGRlcCBvZiB0aGlzLmRlcGVuZGVuY2llcykge1xyXG4gICAgICAgIGxldCBpbm5lck1hcCA9IGRlcCgpXHJcbiAgICAgICAgLy8gdG9kbzogcmVwb3J0IGFzIHVucmVzb2x2ZWQ/XHJcbiAgICAgICAgaWYgKCFpbm5lck1hcCkgY29udGludWVcclxuXHJcbiAgICAgICAgLy8gc2FmZWd1YXJkIGFnYWluc3QgY3ljbGVzXHJcbiAgICAgICAgaWYgKGlubmVyTWFwLnBhdGggPT09IHRoaXMucGF0aCkgY29udGludWVcclxuXHJcbiAgICAgICAgbGV0IGlubmVyVmFsdWUgPSBpbm5lck1hcC5oYXNEZWVwKG5hbWUpXHJcbiAgICAgICAgaWYgKGlubmVyVmFsdWUuZm91bmQpIHtcclxuICAgICAgICAgIGlubmVyVmFsdWUucGF0aC51bnNoaWZ0KHRoaXMpXHJcbiAgICAgICAgICByZXR1cm4gaW5uZXJWYWx1ZVxyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiB7IGZvdW5kOiBmYWxzZSwgcGF0aDogW3RoaXNdIH1cclxuICB9XHJcblxyXG4gIGdldChuYW1lKSB7XHJcbiAgICBpZiAodGhpcy5uYW1lc3BhY2UuaGFzKG5hbWUpKSByZXR1cm4gdGhpcy5uYW1lc3BhY2UuZ2V0KG5hbWUpXHJcblxyXG4gICAgaWYgKHRoaXMucmVleHBvcnRzLmhhcyhuYW1lKSkge1xyXG4gICAgICBjb25zdCByZWV4cG9ydHMgPSB0aGlzLnJlZXhwb3J0cy5nZXQobmFtZSlcclxuICAgICAgICAgICwgaW1wb3J0ZWQgPSByZWV4cG9ydHMuZ2V0SW1wb3J0KClcclxuXHJcbiAgICAgIC8vIGlmIGltcG9ydCBpcyBpZ25vcmVkLCByZXR1cm4gZXhwbGljaXQgJ251bGwnXHJcbiAgICAgIGlmIChpbXBvcnRlZCA9PSBudWxsKSByZXR1cm4gbnVsbFxyXG5cclxuICAgICAgLy8gc2FmZWd1YXJkIGFnYWluc3QgY3ljbGVzLCBvbmx5IGlmIG5hbWUgbWF0Y2hlc1xyXG4gICAgICBpZiAoaW1wb3J0ZWQucGF0aCA9PT0gdGhpcy5wYXRoICYmIHJlZXhwb3J0cy5sb2NhbCA9PT0gbmFtZSkgcmV0dXJuIHVuZGVmaW5lZFxyXG5cclxuICAgICAgcmV0dXJuIGltcG9ydGVkLmdldChyZWV4cG9ydHMubG9jYWwpXHJcbiAgICB9XHJcblxyXG4gICAgLy8gZGVmYXVsdCBleHBvcnRzIG11c3QgYmUgZXhwbGljaXRseSByZS1leHBvcnRlZCAoIzMyOClcclxuICAgIGlmIChuYW1lICE9PSAnZGVmYXVsdCcpIHtcclxuICAgICAgZm9yIChsZXQgZGVwIG9mIHRoaXMuZGVwZW5kZW5jaWVzKSB7XHJcbiAgICAgICAgbGV0IGlubmVyTWFwID0gZGVwKClcclxuICAgICAgICAvLyB0b2RvOiByZXBvcnQgYXMgdW5yZXNvbHZlZD9cclxuICAgICAgICBpZiAoIWlubmVyTWFwKSBjb250aW51ZVxyXG5cclxuICAgICAgICAvLyBzYWZlZ3VhcmQgYWdhaW5zdCBjeWNsZXNcclxuICAgICAgICBpZiAoaW5uZXJNYXAucGF0aCA9PT0gdGhpcy5wYXRoKSBjb250aW51ZVxyXG5cclxuICAgICAgICBsZXQgaW5uZXJWYWx1ZSA9IGlubmVyTWFwLmdldChuYW1lKVxyXG4gICAgICAgIGlmIChpbm5lclZhbHVlICE9PSB1bmRlZmluZWQpIHJldHVybiBpbm5lclZhbHVlXHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gdW5kZWZpbmVkXHJcbiAgfVxyXG5cclxuICBmb3JFYWNoKGNhbGxiYWNrLCB0aGlzQXJnKSB7XHJcbiAgICB0aGlzLm5hbWVzcGFjZS5mb3JFYWNoKCh2LCBuKSA9PlxyXG4gICAgICBjYWxsYmFjay5jYWxsKHRoaXNBcmcsIHYsIG4sIHRoaXMpKVxyXG5cclxuICAgIHRoaXMucmVleHBvcnRzLmZvckVhY2goKHJlZXhwb3J0cywgbmFtZSkgPT4ge1xyXG4gICAgICBjb25zdCByZWV4cG9ydGVkID0gcmVleHBvcnRzLmdldEltcG9ydCgpXHJcbiAgICAgIC8vIGNhbid0IGxvb2sgdXAgbWV0YSBmb3IgaWdub3JlZCByZS1leHBvcnRzICgjMzQ4KVxyXG4gICAgICBjYWxsYmFjay5jYWxsKHRoaXNBcmcsIHJlZXhwb3J0ZWQgJiYgcmVleHBvcnRlZC5nZXQocmVleHBvcnRzLmxvY2FsKSwgbmFtZSwgdGhpcylcclxuICAgIH0pXHJcblxyXG4gICAgdGhpcy5kZXBlbmRlbmNpZXMuZm9yRWFjaChkZXAgPT4ge1xyXG4gICAgICBjb25zdCBkID0gZGVwKClcclxuICAgICAgLy8gQ0pTIC8gaWdub3JlZCBkZXBlbmRlbmNpZXMgd29uJ3QgZXhpc3QgKCM3MTcpXHJcbiAgICAgIGlmIChkID09IG51bGwpIHJldHVyblxyXG5cclxuICAgICAgZC5mb3JFYWNoKCh2LCBuKSA9PlxyXG4gICAgICAgIG4gIT09ICdkZWZhdWx0JyAmJiBjYWxsYmFjay5jYWxsKHRoaXNBcmcsIHYsIG4sIHRoaXMpKVxyXG4gICAgfSlcclxuICB9XHJcblxyXG4gIC8vIHRvZG86IGtleXMsIHZhbHVlcywgZW50cmllcz9cclxuXHJcbiAgcmVwb3J0RXJyb3JzKGNvbnRleHQsIGRlY2xhcmF0aW9uKSB7XHJcbiAgICBjb250ZXh0LnJlcG9ydCh7XHJcbiAgICAgIG5vZGU6IGRlY2xhcmF0aW9uLnNvdXJjZSxcclxuICAgICAgbWVzc2FnZTogYFBhcnNlIGVycm9ycyBpbiBpbXBvcnRlZCBtb2R1bGUgJyR7ZGVjbGFyYXRpb24uc291cmNlLnZhbHVlfSc6IGAgK1xyXG4gICAgICAgICAgICAgICAgICBgJHt0aGlzLmVycm9yc1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAubWFwKGUgPT4gYCR7ZS5tZXNzYWdlfSAoJHtlLmxpbmVOdW1iZXJ9OiR7ZS5jb2x1bW59KWApXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC5qb2luKCcsICcpfWAsXHJcbiAgICB9KVxyXG4gIH1cclxufVxyXG5cclxuLyoqXHJcbiAqIHBhcnNlIGRvY3MgZnJvbSB0aGUgZmlyc3Qgbm9kZSB0aGF0IGhhcyBsZWFkaW5nIGNvbW1lbnRzXHJcbiAqL1xyXG5mdW5jdGlvbiBjYXB0dXJlRG9jKHNvdXJjZSwgZG9jU3R5bGVQYXJzZXJzLCAuLi5ub2Rlcykge1xyXG4gIGNvbnN0IG1ldGFkYXRhID0ge31cclxuXHJcbiAgLy8gJ3NvbWUnIHNob3J0LWNpcmN1aXRzIG9uIGZpcnN0ICd0cnVlJ1xyXG4gIG5vZGVzLnNvbWUobiA9PiB7XHJcbiAgICB0cnkge1xyXG5cclxuICAgICAgbGV0IGxlYWRpbmdDb21tZW50c1xyXG5cclxuICAgICAgLy8gbi5sZWFkaW5nQ29tbWVudHMgaXMgbGVnYWN5IGBhdHRhY2hDb21tZW50c2AgYmVoYXZpb3JcclxuICAgICAgaWYgKCdsZWFkaW5nQ29tbWVudHMnIGluIG4pIHtcclxuICAgICAgICBsZWFkaW5nQ29tbWVudHMgPSBuLmxlYWRpbmdDb21tZW50c1xyXG4gICAgICB9IGVsc2UgaWYgKG4ucmFuZ2UpIHtcclxuICAgICAgICBsZWFkaW5nQ29tbWVudHMgPSBzb3VyY2UuZ2V0Q29tbWVudHNCZWZvcmUobilcclxuICAgICAgfVxyXG5cclxuICAgICAgaWYgKCFsZWFkaW5nQ29tbWVudHMgfHwgbGVhZGluZ0NvbW1lbnRzLmxlbmd0aCA9PT0gMCkgcmV0dXJuIGZhbHNlXHJcblxyXG4gICAgICBmb3IgKGxldCBuYW1lIGluIGRvY1N0eWxlUGFyc2Vycykge1xyXG4gICAgICAgIGNvbnN0IGRvYyA9IGRvY1N0eWxlUGFyc2Vyc1tuYW1lXShsZWFkaW5nQ29tbWVudHMpXHJcbiAgICAgICAgaWYgKGRvYykge1xyXG4gICAgICAgICAgbWV0YWRhdGEuZG9jID0gZG9jXHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcblxyXG4gICAgICByZXR1cm4gdHJ1ZVxyXG4gICAgfSBjYXRjaCAoZXJyKSB7XHJcbiAgICAgIHJldHVybiBmYWxzZVxyXG4gICAgfVxyXG4gIH0pXHJcblxyXG4gIHJldHVybiBtZXRhZGF0YVxyXG59XHJcblxyXG5jb25zdCBhdmFpbGFibGVEb2NTdHlsZVBhcnNlcnMgPSB7XHJcbiAganNkb2M6IGNhcHR1cmVKc0RvYyxcclxuICB0b21kb2M6IGNhcHR1cmVUb21Eb2MsXHJcbn1cclxuXHJcbi8qKlxyXG4gKiBwYXJzZSBKU0RvYyBmcm9tIGxlYWRpbmcgY29tbWVudHNcclxuICogQHBhcmFtICB7Li4uW3R5cGVdfSBjb21tZW50cyBbZGVzY3JpcHRpb25dXHJcbiAqIEByZXR1cm4ge3tkb2M6IG9iamVjdH19XHJcbiAqL1xyXG5mdW5jdGlvbiBjYXB0dXJlSnNEb2MoY29tbWVudHMpIHtcclxuICBsZXQgZG9jXHJcblxyXG4gIC8vIGNhcHR1cmUgWFNEb2NcclxuICBjb21tZW50cy5mb3JFYWNoKGNvbW1lbnQgPT4ge1xyXG4gICAgLy8gc2tpcCBub24tYmxvY2sgY29tbWVudHNcclxuICAgIGlmIChjb21tZW50LnR5cGUgIT09ICdCbG9jaycpIHJldHVyblxyXG4gICAgdHJ5IHtcclxuICAgICAgZG9jID0gZG9jdHJpbmUucGFyc2UoY29tbWVudC52YWx1ZSwgeyB1bndyYXA6IHRydWUgfSlcclxuICAgIH0gY2F0Y2ggKGVycikge1xyXG4gICAgICAvKiBkb24ndCBjYXJlLCBmb3Igbm93PyBtYXliZSBhZGQgdG8gYGVycm9ycz9gICovXHJcbiAgICB9XHJcbiAgfSlcclxuXHJcbiAgcmV0dXJuIGRvY1xyXG59XHJcblxyXG4vKipcclxuICAqIHBhcnNlIFRvbURvYyBzZWN0aW9uIGZyb20gY29tbWVudHNcclxuICAqL1xyXG5mdW5jdGlvbiBjYXB0dXJlVG9tRG9jKGNvbW1lbnRzKSB7XHJcbiAgLy8gY29sbGVjdCBsaW5lcyB1cCB0byBmaXJzdCBwYXJhZ3JhcGggYnJlYWtcclxuICBjb25zdCBsaW5lcyA9IFtdXHJcbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBjb21tZW50cy5sZW5ndGg7IGkrKykge1xyXG4gICAgY29uc3QgY29tbWVudCA9IGNvbW1lbnRzW2ldXHJcbiAgICBpZiAoY29tbWVudC52YWx1ZS5tYXRjaCgvXlxccyokLykpIGJyZWFrXHJcbiAgICBsaW5lcy5wdXNoKGNvbW1lbnQudmFsdWUudHJpbSgpKVxyXG4gIH1cclxuXHJcbiAgLy8gcmV0dXJuIGRvY3RyaW5lLWxpa2Ugb2JqZWN0XHJcbiAgY29uc3Qgc3RhdHVzTWF0Y2ggPSBsaW5lcy5qb2luKCcgJykubWF0Y2goL14oUHVibGljfEludGVybmFsfERlcHJlY2F0ZWQpOlxccyooLispLylcclxuICBpZiAoc3RhdHVzTWF0Y2gpIHtcclxuICAgIHJldHVybiB7XHJcbiAgICAgIGRlc2NyaXB0aW9uOiBzdGF0dXNNYXRjaFsyXSxcclxuICAgICAgdGFnczogW3tcclxuICAgICAgICB0aXRsZTogc3RhdHVzTWF0Y2hbMV0udG9Mb3dlckNhc2UoKSxcclxuICAgICAgICBkZXNjcmlwdGlvbjogc3RhdHVzTWF0Y2hbMl0sXHJcbiAgICAgIH1dLFxyXG4gICAgfVxyXG4gIH1cclxufVxyXG5cclxuRXhwb3J0TWFwLmdldCA9IGZ1bmN0aW9uIChzb3VyY2UsIGNvbnRleHQpIHtcclxuICBjb25zdCBwYXRoID0gcmVzb2x2ZShzb3VyY2UsIGNvbnRleHQpXHJcbiAgaWYgKHBhdGggPT0gbnVsbCkgcmV0dXJuIG51bGxcclxuXHJcbiAgcmV0dXJuIEV4cG9ydE1hcC5mb3IoY2hpbGRDb250ZXh0KHBhdGgsIGNvbnRleHQpKVxyXG59XHJcblxyXG5FeHBvcnRNYXAuZm9yID0gZnVuY3Rpb24gKGNvbnRleHQpIHtcclxuICBjb25zdCB7IHBhdGggfSA9IGNvbnRleHRcclxuXHJcbiAgY29uc3QgY2FjaGVLZXkgPSBoYXNoT2JqZWN0KGNvbnRleHQpLmRpZ2VzdCgnaGV4JylcclxuICBsZXQgZXhwb3J0TWFwID0gZXhwb3J0Q2FjaGUuZ2V0KGNhY2hlS2V5KVxyXG5cclxuICAvLyByZXR1cm4gY2FjaGVkIGlnbm9yZVxyXG4gIGlmIChleHBvcnRNYXAgPT09IG51bGwpIHJldHVybiBudWxsXHJcblxyXG4gIGNvbnN0IHN0YXRzID0gZnMuc3RhdFN5bmMocGF0aClcclxuICBpZiAoZXhwb3J0TWFwICE9IG51bGwpIHtcclxuICAgIC8vIGRhdGUgZXF1YWxpdHkgY2hlY2tcclxuICAgIGlmIChleHBvcnRNYXAubXRpbWUgLSBzdGF0cy5tdGltZSA9PT0gMCkge1xyXG4gICAgICByZXR1cm4gZXhwb3J0TWFwXHJcbiAgICB9XHJcbiAgICAvLyBmdXR1cmU6IGNoZWNrIGNvbnRlbnQgZXF1YWxpdHk/XHJcbiAgfVxyXG5cclxuICAvLyBjaGVjayB2YWxpZCBleHRlbnNpb25zIGZpcnN0XHJcbiAgaWYgKCFoYXNWYWxpZEV4dGVuc2lvbihwYXRoLCBjb250ZXh0KSkge1xyXG4gICAgZXhwb3J0Q2FjaGUuc2V0KGNhY2hlS2V5LCBudWxsKVxyXG4gICAgcmV0dXJuIG51bGxcclxuICB9XHJcblxyXG4gIGNvbnN0IGNvbnRlbnQgPSBmcy5yZWFkRmlsZVN5bmMocGF0aCwgeyBlbmNvZGluZzogJ3V0ZjgnIH0pXHJcblxyXG4gIC8vIGNoZWNrIGZvciBhbmQgY2FjaGUgaWdub3JlXHJcbiAgaWYgKGlzSWdub3JlZChwYXRoLCBjb250ZXh0KSB8fCAhdW5hbWJpZ3VvdXMudGVzdChjb250ZW50KSkge1xyXG4gICAgbG9nKCdpZ25vcmVkIHBhdGggZHVlIHRvIHVuYW1iaWd1b3VzIHJlZ2V4IG9yIGlnbm9yZSBzZXR0aW5nczonLCBwYXRoKVxyXG4gICAgZXhwb3J0Q2FjaGUuc2V0KGNhY2hlS2V5LCBudWxsKVxyXG4gICAgcmV0dXJuIG51bGxcclxuICB9XHJcblxyXG4gIGxvZygnY2FjaGUgbWlzcycsIGNhY2hlS2V5LCAnZm9yIHBhdGgnLCBwYXRoKVxyXG4gIGV4cG9ydE1hcCA9IEV4cG9ydE1hcC5wYXJzZShwYXRoLCBjb250ZW50LCBjb250ZXh0KVxyXG5cclxuICAvLyBhbWJpZ3VvdXMgbW9kdWxlcyByZXR1cm4gbnVsbFxyXG4gIGlmIChleHBvcnRNYXAgPT0gbnVsbCkgcmV0dXJuIG51bGxcclxuXHJcbiAgZXhwb3J0TWFwLm10aW1lID0gc3RhdHMubXRpbWVcclxuXHJcbiAgZXhwb3J0Q2FjaGUuc2V0KGNhY2hlS2V5LCBleHBvcnRNYXApXHJcbiAgcmV0dXJuIGV4cG9ydE1hcFxyXG59XHJcblxyXG5cclxuRXhwb3J0TWFwLnBhcnNlID0gZnVuY3Rpb24gKHBhdGgsIGNvbnRlbnQsIGNvbnRleHQpIHtcclxuICB2YXIgbSA9IG5ldyBFeHBvcnRNYXAocGF0aClcclxuXHJcbiAgdHJ5IHtcclxuICAgIHZhciBhc3QgPSBwYXJzZShwYXRoLCBjb250ZW50LCBjb250ZXh0KVxyXG4gIH0gY2F0Y2ggKGVycikge1xyXG4gICAgbG9nKCdwYXJzZSBlcnJvcjonLCBwYXRoLCBlcnIpXHJcbiAgICBtLmVycm9ycy5wdXNoKGVycilcclxuICAgIHJldHVybiBtIC8vIGNhbid0IGNvbnRpbnVlXHJcbiAgfVxyXG5cclxuICBpZiAoIXVuYW1iaWd1b3VzLmlzTW9kdWxlKGFzdCkpIHJldHVybiBudWxsXHJcblxyXG4gIGNvbnN0IGRvY3N0eWxlID0gKGNvbnRleHQuc2V0dGluZ3MgJiYgY29udGV4dC5zZXR0aW5nc1snaW1wb3J0L2RvY3N0eWxlJ10pIHx8IFsnanNkb2MnXVxyXG4gIGNvbnN0IGRvY1N0eWxlUGFyc2VycyA9IHt9XHJcbiAgZG9jc3R5bGUuZm9yRWFjaChzdHlsZSA9PiB7XHJcbiAgICBkb2NTdHlsZVBhcnNlcnNbc3R5bGVdID0gYXZhaWxhYmxlRG9jU3R5bGVQYXJzZXJzW3N0eWxlXVxyXG4gIH0pXHJcblxyXG4gIC8vIGF0dGVtcHQgdG8gY29sbGVjdCBtb2R1bGUgZG9jXHJcbiAgaWYgKGFzdC5jb21tZW50cykge1xyXG4gICAgYXN0LmNvbW1lbnRzLnNvbWUoYyA9PiB7XHJcbiAgICAgIGlmIChjLnR5cGUgIT09ICdCbG9jaycpIHJldHVybiBmYWxzZVxyXG4gICAgICB0cnkge1xyXG4gICAgICAgIGNvbnN0IGRvYyA9IGRvY3RyaW5lLnBhcnNlKGMudmFsdWUsIHsgdW53cmFwOiB0cnVlIH0pXHJcbiAgICAgICAgaWYgKGRvYy50YWdzLnNvbWUodCA9PiB0LnRpdGxlID09PSAnbW9kdWxlJykpIHtcclxuICAgICAgICAgIG0uZG9jID0gZG9jXHJcbiAgICAgICAgICByZXR1cm4gdHJ1ZVxyXG4gICAgICAgIH1cclxuICAgICAgfSBjYXRjaCAoZXJyKSB7IC8qIGlnbm9yZSAqLyB9XHJcbiAgICAgIHJldHVybiBmYWxzZVxyXG4gICAgfSlcclxuICB9XHJcblxyXG4gIGNvbnN0IG5hbWVzcGFjZXMgPSBuZXcgTWFwKClcclxuXHJcbiAgZnVuY3Rpb24gcmVtb3RlUGF0aCh2YWx1ZSkge1xyXG4gICAgcmV0dXJuIHJlc29sdmUucmVsYXRpdmUodmFsdWUsIHBhdGgsIGNvbnRleHQuc2V0dGluZ3MpXHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiByZXNvbHZlSW1wb3J0KHZhbHVlKSB7XHJcbiAgICBjb25zdCBycCA9IHJlbW90ZVBhdGgodmFsdWUpXHJcbiAgICBpZiAocnAgPT0gbnVsbCkgcmV0dXJuIG51bGxcclxuICAgIHJldHVybiBFeHBvcnRNYXAuZm9yKGNoaWxkQ29udGV4dChycCwgY29udGV4dCkpXHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiBnZXROYW1lc3BhY2UoaWRlbnRpZmllcikge1xyXG4gICAgaWYgKCFuYW1lc3BhY2VzLmhhcyhpZGVudGlmaWVyLm5hbWUpKSByZXR1cm5cclxuXHJcbiAgICByZXR1cm4gZnVuY3Rpb24gKCkge1xyXG4gICAgICByZXR1cm4gcmVzb2x2ZUltcG9ydChuYW1lc3BhY2VzLmdldChpZGVudGlmaWVyLm5hbWUpKVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gYWRkTmFtZXNwYWNlKG9iamVjdCwgaWRlbnRpZmllcikge1xyXG4gICAgY29uc3QgbnNmbiA9IGdldE5hbWVzcGFjZShpZGVudGlmaWVyKVxyXG4gICAgaWYgKG5zZm4pIHtcclxuICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KG9iamVjdCwgJ25hbWVzcGFjZScsIHsgZ2V0OiBuc2ZuIH0pXHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIG9iamVjdFxyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gY2FwdHVyZURlcGVuZGVuY3koZGVjbGFyYXRpb24pIHtcclxuICAgIGlmIChkZWNsYXJhdGlvbi5zb3VyY2UgPT0gbnVsbCkgcmV0dXJuIG51bGxcclxuICAgIGNvbnN0IGltcG9ydGVkU3BlY2lmaWVycyA9IG5ldyBTZXQoKVxyXG4gICAgY29uc3Qgc3VwcG9ydGVkVHlwZXMgPSBuZXcgU2V0KFsnSW1wb3J0RGVmYXVsdFNwZWNpZmllcicsICdJbXBvcnROYW1lc3BhY2VTcGVjaWZpZXInXSlcclxuICAgIGlmIChkZWNsYXJhdGlvbi5zcGVjaWZpZXJzKSB7XHJcbiAgICAgIGRlY2xhcmF0aW9uLnNwZWNpZmllcnMuZm9yRWFjaChzcGVjaWZpZXIgPT4ge1xyXG4gICAgICAgIGlmIChzdXBwb3J0ZWRUeXBlcy5oYXMoc3BlY2lmaWVyLnR5cGUpKSB7XHJcbiAgICAgICAgICBpbXBvcnRlZFNwZWNpZmllcnMuYWRkKHNwZWNpZmllci50eXBlKVxyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoc3BlY2lmaWVyLnR5cGUgPT09ICdJbXBvcnRTcGVjaWZpZXInKSB7XHJcbiAgICAgICAgICBpbXBvcnRlZFNwZWNpZmllcnMuYWRkKHNwZWNpZmllci5pbXBvcnRlZC5uYW1lKVxyXG4gICAgICAgIH1cclxuICAgICAgfSlcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCBwID0gcmVtb3RlUGF0aChkZWNsYXJhdGlvbi5zb3VyY2UudmFsdWUpXHJcbiAgICBpZiAocCA9PSBudWxsKSByZXR1cm4gbnVsbFxyXG4gICAgY29uc3QgZXhpc3RpbmcgPSBtLmltcG9ydHMuZ2V0KHApXHJcbiAgICBpZiAoZXhpc3RpbmcgIT0gbnVsbCkgcmV0dXJuIGV4aXN0aW5nLmdldHRlclxyXG5cclxuICAgIGNvbnN0IGdldHRlciA9IHRodW5rRm9yKHAsIGNvbnRleHQpXHJcbiAgICBtLmltcG9ydHMuc2V0KHAsIHtcclxuICAgICAgZ2V0dGVyLFxyXG4gICAgICBzb3VyY2U6IHsgIC8vIGNhcHR1cmluZyBhY3R1YWwgbm9kZSByZWZlcmVuY2UgaG9sZHMgZnVsbCBBU1QgaW4gbWVtb3J5IVxyXG4gICAgICAgIHZhbHVlOiBkZWNsYXJhdGlvbi5zb3VyY2UudmFsdWUsXHJcbiAgICAgICAgbG9jOiBkZWNsYXJhdGlvbi5zb3VyY2UubG9jLFxyXG4gICAgICB9LFxyXG4gICAgICBpbXBvcnRlZFNwZWNpZmllcnMsXHJcbiAgICB9KVxyXG4gICAgcmV0dXJuIGdldHRlclxyXG4gIH1cclxuXHJcbiAgY29uc3Qgc291cmNlID0gbWFrZVNvdXJjZUNvZGUoY29udGVudCwgYXN0KVxyXG5cclxuICBhc3QuYm9keS5mb3JFYWNoKGZ1bmN0aW9uIChuKSB7XHJcblxyXG4gICAgaWYgKG4udHlwZSA9PT0gJ0V4cG9ydERlZmF1bHREZWNsYXJhdGlvbicpIHtcclxuICAgICAgY29uc3QgZXhwb3J0TWV0YSA9IGNhcHR1cmVEb2Moc291cmNlLCBkb2NTdHlsZVBhcnNlcnMsIG4pXHJcbiAgICAgIGlmIChuLmRlY2xhcmF0aW9uLnR5cGUgPT09ICdJZGVudGlmaWVyJykge1xyXG4gICAgICAgIGFkZE5hbWVzcGFjZShleHBvcnRNZXRhLCBuLmRlY2xhcmF0aW9uKVxyXG4gICAgICB9XHJcbiAgICAgIG0ubmFtZXNwYWNlLnNldCgnZGVmYXVsdCcsIGV4cG9ydE1ldGEpXHJcbiAgICAgIHJldHVyblxyXG4gICAgfVxyXG5cclxuICAgIGlmIChuLnR5cGUgPT09ICdFeHBvcnRBbGxEZWNsYXJhdGlvbicpIHtcclxuICAgICAgY29uc3QgZ2V0dGVyID0gY2FwdHVyZURlcGVuZGVuY3kobilcclxuICAgICAgaWYgKGdldHRlcikgbS5kZXBlbmRlbmNpZXMuYWRkKGdldHRlcilcclxuICAgICAgcmV0dXJuXHJcbiAgICB9XHJcblxyXG4gICAgLy8gY2FwdHVyZSBuYW1lc3BhY2VzIGluIGNhc2Ugb2YgbGF0ZXIgZXhwb3J0XHJcbiAgICBpZiAobi50eXBlID09PSAnSW1wb3J0RGVjbGFyYXRpb24nKSB7XHJcbiAgICAgIGNhcHR1cmVEZXBlbmRlbmN5KG4pXHJcbiAgICAgIGxldCBuc1xyXG4gICAgICBpZiAobi5zcGVjaWZpZXJzLnNvbWUocyA9PiBzLnR5cGUgPT09ICdJbXBvcnROYW1lc3BhY2VTcGVjaWZpZXInICYmIChucyA9IHMpKSkge1xyXG4gICAgICAgIG5hbWVzcGFjZXMuc2V0KG5zLmxvY2FsLm5hbWUsIG4uc291cmNlLnZhbHVlKVxyXG4gICAgICB9XHJcbiAgICAgIHJldHVyblxyXG4gICAgfVxyXG5cclxuICAgIGlmIChuLnR5cGUgPT09ICdFeHBvcnROYW1lZERlY2xhcmF0aW9uJykge1xyXG4gICAgICAvLyBjYXB0dXJlIGRlY2xhcmF0aW9uXHJcbiAgICAgIGlmIChuLmRlY2xhcmF0aW9uICE9IG51bGwpIHtcclxuICAgICAgICBzd2l0Y2ggKG4uZGVjbGFyYXRpb24udHlwZSkge1xyXG4gICAgICAgICAgY2FzZSAnRnVuY3Rpb25EZWNsYXJhdGlvbic6XHJcbiAgICAgICAgICBjYXNlICdDbGFzc0RlY2xhcmF0aW9uJzpcclxuICAgICAgICAgIGNhc2UgJ1R5cGVBbGlhcyc6IC8vIGZsb3d0eXBlIHdpdGggYmFiZWwtZXNsaW50IHBhcnNlclxyXG4gICAgICAgICAgY2FzZSAnSW50ZXJmYWNlRGVjbGFyYXRpb24nOlxyXG4gICAgICAgICAgY2FzZSAnRGVjbGFyZUZ1bmN0aW9uJzpcclxuICAgICAgICAgIGNhc2UgJ1RTRGVjbGFyZUZ1bmN0aW9uJzpcclxuICAgICAgICAgIGNhc2UgJ1RTRW51bURlY2xhcmF0aW9uJzpcclxuICAgICAgICAgIGNhc2UgJ1RTVHlwZUFsaWFzRGVjbGFyYXRpb24nOlxyXG4gICAgICAgICAgY2FzZSAnVFNJbnRlcmZhY2VEZWNsYXJhdGlvbic6XHJcbiAgICAgICAgICBjYXNlICdUU0Fic3RyYWN0Q2xhc3NEZWNsYXJhdGlvbic6XHJcbiAgICAgICAgICBjYXNlICdUU01vZHVsZURlY2xhcmF0aW9uJzpcclxuICAgICAgICAgICAgbS5uYW1lc3BhY2Uuc2V0KG4uZGVjbGFyYXRpb24uaWQubmFtZSwgY2FwdHVyZURvYyhzb3VyY2UsIGRvY1N0eWxlUGFyc2VycywgbikpXHJcbiAgICAgICAgICAgIGJyZWFrXHJcbiAgICAgICAgICBjYXNlICdWYXJpYWJsZURlY2xhcmF0aW9uJzpcclxuICAgICAgICAgICAgbi5kZWNsYXJhdGlvbi5kZWNsYXJhdGlvbnMuZm9yRWFjaCgoZCkgPT5cclxuICAgICAgICAgICAgICByZWN1cnNpdmVQYXR0ZXJuQ2FwdHVyZShkLmlkLFxyXG4gICAgICAgICAgICAgICAgaWQgPT4gbS5uYW1lc3BhY2Uuc2V0KGlkLm5hbWUsIGNhcHR1cmVEb2Moc291cmNlLCBkb2NTdHlsZVBhcnNlcnMsIGQsIG4pKSkpXHJcbiAgICAgICAgICAgIGJyZWFrXHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcblxyXG4gICAgICBjb25zdCBuc291cmNlID0gbi5zb3VyY2UgJiYgbi5zb3VyY2UudmFsdWVcclxuICAgICAgbi5zcGVjaWZpZXJzLmZvckVhY2goKHMpID0+IHtcclxuICAgICAgICBjb25zdCBleHBvcnRNZXRhID0ge31cclxuICAgICAgICBsZXQgbG9jYWxcclxuXHJcbiAgICAgICAgc3dpdGNoIChzLnR5cGUpIHtcclxuICAgICAgICAgIGNhc2UgJ0V4cG9ydERlZmF1bHRTcGVjaWZpZXInOlxyXG4gICAgICAgICAgICBpZiAoIW4uc291cmNlKSByZXR1cm5cclxuICAgICAgICAgICAgbG9jYWwgPSAnZGVmYXVsdCdcclxuICAgICAgICAgICAgYnJlYWtcclxuICAgICAgICAgIGNhc2UgJ0V4cG9ydE5hbWVzcGFjZVNwZWNpZmllcic6XHJcbiAgICAgICAgICAgIG0ubmFtZXNwYWNlLnNldChzLmV4cG9ydGVkLm5hbWUsIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRNZXRhLCAnbmFtZXNwYWNlJywge1xyXG4gICAgICAgICAgICAgIGdldCgpIHsgcmV0dXJuIHJlc29sdmVJbXBvcnQobnNvdXJjZSkgfSxcclxuICAgICAgICAgICAgfSkpXHJcbiAgICAgICAgICAgIHJldHVyblxyXG4gICAgICAgICAgY2FzZSAnRXhwb3J0U3BlY2lmaWVyJzpcclxuICAgICAgICAgICAgaWYgKCFuLnNvdXJjZSkge1xyXG4gICAgICAgICAgICAgIG0ubmFtZXNwYWNlLnNldChzLmV4cG9ydGVkLm5hbWUsIGFkZE5hbWVzcGFjZShleHBvcnRNZXRhLCBzLmxvY2FsKSlcclxuICAgICAgICAgICAgICByZXR1cm5cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAvLyBlbHNlIGZhbGxzIHRocm91Z2hcclxuICAgICAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgICAgIGxvY2FsID0gcy5sb2NhbC5uYW1lXHJcbiAgICAgICAgICAgIGJyZWFrXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyB0b2RvOiBKU0RvY1xyXG4gICAgICAgIG0ucmVleHBvcnRzLnNldChzLmV4cG9ydGVkLm5hbWUsIHsgbG9jYWwsIGdldEltcG9ydDogKCkgPT4gcmVzb2x2ZUltcG9ydChuc291cmNlKSB9KVxyXG4gICAgICB9KVxyXG4gICAgfVxyXG5cclxuICAgIC8vIFRoaXMgZG9lc24ndCBkZWNsYXJlIGFueXRoaW5nLCBidXQgY2hhbmdlcyB3aGF0J3MgYmVpbmcgZXhwb3J0ZWQuXHJcbiAgICBpZiAobi50eXBlID09PSAnVFNFeHBvcnRBc3NpZ25tZW50Jykge1xyXG4gICAgICBjb25zdCBtb2R1bGVEZWNsID0gYXN0LmJvZHkuZmluZCgoYm9keU5vZGUpID0+XHJcbiAgICAgICAgYm9keU5vZGUudHlwZSA9PT0gJ1RTTW9kdWxlRGVjbGFyYXRpb24nICYmIGJvZHlOb2RlLmlkLm5hbWUgPT09IG4uZXhwcmVzc2lvbi5uYW1lXHJcbiAgICAgIClcclxuICAgICAgaWYgKG1vZHVsZURlY2wgJiYgbW9kdWxlRGVjbC5ib2R5ICYmIG1vZHVsZURlY2wuYm9keS5ib2R5KSB7XHJcbiAgICAgICAgbW9kdWxlRGVjbC5ib2R5LmJvZHkuZm9yRWFjaCgobW9kdWxlQmxvY2tOb2RlKSA9PiB7XHJcbiAgICAgICAgICAvLyBFeHBvcnQtYXNzaWdubWVudCBleHBvcnRzIGFsbCBtZW1iZXJzIGluIHRoZSBuYW1lc3BhY2UsIGV4cGxpY2l0bHkgZXhwb3J0ZWQgb3Igbm90LlxyXG4gICAgICAgICAgY29uc3QgZXhwb3J0ZWREZWNsID0gbW9kdWxlQmxvY2tOb2RlLnR5cGUgPT09ICdFeHBvcnROYW1lZERlY2xhcmF0aW9uJyA/XHJcbiAgICAgICAgICAgIG1vZHVsZUJsb2NrTm9kZS5kZWNsYXJhdGlvbiA6XHJcbiAgICAgICAgICAgIG1vZHVsZUJsb2NrTm9kZVxyXG5cclxuICAgICAgICAgIGlmIChleHBvcnRlZERlY2wudHlwZSA9PT0gJ1ZhcmlhYmxlRGVjbGFyYXRpb24nKSB7XHJcbiAgICAgICAgICAgIGV4cG9ydGVkRGVjbC5kZWNsYXJhdGlvbnMuZm9yRWFjaCgoZGVjbCkgPT5cclxuICAgICAgICAgICAgICByZWN1cnNpdmVQYXR0ZXJuQ2FwdHVyZShkZWNsLmlkLChpZCkgPT4gbS5uYW1lc3BhY2Uuc2V0KFxyXG4gICAgICAgICAgICAgICAgaWQubmFtZSxcclxuICAgICAgICAgICAgICAgIGNhcHR1cmVEb2Moc291cmNlLCBkb2NTdHlsZVBhcnNlcnMsIGRlY2wsIGV4cG9ydGVkRGVjbCwgbW9kdWxlQmxvY2tOb2RlKSlcclxuICAgICAgICAgICAgICApXHJcbiAgICAgICAgICAgIClcclxuICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIG0ubmFtZXNwYWNlLnNldChcclxuICAgICAgICAgICAgICBleHBvcnRlZERlY2wuaWQubmFtZSxcclxuICAgICAgICAgICAgICBjYXB0dXJlRG9jKHNvdXJjZSwgZG9jU3R5bGVQYXJzZXJzLCBtb2R1bGVCbG9ja05vZGUpKVxyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH0pXHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9KVxyXG5cclxuICByZXR1cm4gbVxyXG59XHJcblxyXG4vKipcclxuICogVGhlIGNyZWF0aW9uIG9mIHRoaXMgY2xvc3VyZSBpcyBpc29sYXRlZCBmcm9tIG90aGVyIHNjb3Blc1xyXG4gKiB0byBhdm9pZCBvdmVyLXJldGVudGlvbiBvZiB1bnJlbGF0ZWQgdmFyaWFibGVzLCB3aGljaCBoYXNcclxuICogY2F1c2VkIG1lbW9yeSBsZWFrcy4gU2VlICMxMjY2LlxyXG4gKi9cclxuZnVuY3Rpb24gdGh1bmtGb3IocCwgY29udGV4dCkge1xyXG4gIHJldHVybiAoKSA9PiBFeHBvcnRNYXAuZm9yKGNoaWxkQ29udGV4dChwLCBjb250ZXh0KSlcclxufVxyXG5cclxuXHJcbi8qKlxyXG4gKiBUcmF2ZXJzZSBhIHBhdHRlcm4vaWRlbnRpZmllciBub2RlLCBjYWxsaW5nICdjYWxsYmFjaydcclxuICogZm9yIGVhY2ggbGVhZiBpZGVudGlmaWVyLlxyXG4gKiBAcGFyYW0gIHtub2RlfSAgIHBhdHRlcm5cclxuICogQHBhcmFtICB7RnVuY3Rpb259IGNhbGxiYWNrXHJcbiAqIEByZXR1cm4ge3ZvaWR9XHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gcmVjdXJzaXZlUGF0dGVybkNhcHR1cmUocGF0dGVybiwgY2FsbGJhY2spIHtcclxuICBzd2l0Y2ggKHBhdHRlcm4udHlwZSkge1xyXG4gICAgY2FzZSAnSWRlbnRpZmllcic6IC8vIGJhc2UgY2FzZVxyXG4gICAgICBjYWxsYmFjayhwYXR0ZXJuKVxyXG4gICAgICBicmVha1xyXG5cclxuICAgIGNhc2UgJ09iamVjdFBhdHRlcm4nOlxyXG4gICAgICBwYXR0ZXJuLnByb3BlcnRpZXMuZm9yRWFjaChwID0+IHtcclxuICAgICAgICByZWN1cnNpdmVQYXR0ZXJuQ2FwdHVyZShwLnZhbHVlLCBjYWxsYmFjaylcclxuICAgICAgfSlcclxuICAgICAgYnJlYWtcclxuXHJcbiAgICBjYXNlICdBcnJheVBhdHRlcm4nOlxyXG4gICAgICBwYXR0ZXJuLmVsZW1lbnRzLmZvckVhY2goKGVsZW1lbnQpID0+IHtcclxuICAgICAgICBpZiAoZWxlbWVudCA9PSBudWxsKSByZXR1cm5cclxuICAgICAgICByZWN1cnNpdmVQYXR0ZXJuQ2FwdHVyZShlbGVtZW50LCBjYWxsYmFjaylcclxuICAgICAgfSlcclxuICAgICAgYnJlYWtcclxuXHJcbiAgICBjYXNlICdBc3NpZ25tZW50UGF0dGVybic6XHJcbiAgICAgIGNhbGxiYWNrKHBhdHRlcm4ubGVmdClcclxuICAgICAgYnJlYWtcclxuICB9XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBkb24ndCBob2xkIGZ1bGwgY29udGV4dCBvYmplY3QgaW4gbWVtb3J5LCBqdXN0IGdyYWIgd2hhdCB3ZSBuZWVkLlxyXG4gKi9cclxuZnVuY3Rpb24gY2hpbGRDb250ZXh0KHBhdGgsIGNvbnRleHQpIHtcclxuICBjb25zdCB7IHNldHRpbmdzLCBwYXJzZXJPcHRpb25zLCBwYXJzZXJQYXRoIH0gPSBjb250ZXh0XHJcbiAgcmV0dXJuIHtcclxuICAgIHNldHRpbmdzLFxyXG4gICAgcGFyc2VyT3B0aW9ucyxcclxuICAgIHBhcnNlclBhdGgsXHJcbiAgICBwYXRoLFxyXG4gIH1cclxufVxyXG5cclxuXHJcbi8qKlxyXG4gKiBzb21ldGltZXMgbGVnYWN5IHN1cHBvcnQgaXNuJ3QgX3RoYXRfIGhhcmQuLi4gcmlnaHQ/XHJcbiAqL1xyXG5mdW5jdGlvbiBtYWtlU291cmNlQ29kZSh0ZXh0LCBhc3QpIHtcclxuICBpZiAoU291cmNlQ29kZS5sZW5ndGggPiAxKSB7XHJcbiAgICAvLyBFU0xpbnQgM1xyXG4gICAgcmV0dXJuIG5ldyBTb3VyY2VDb2RlKHRleHQsIGFzdClcclxuICB9IGVsc2Uge1xyXG4gICAgLy8gRVNMaW50IDQsIDVcclxuICAgIHJldHVybiBuZXcgU291cmNlQ29kZSh7IHRleHQsIGFzdCB9KVxyXG4gIH1cclxufVxyXG4iXX0=