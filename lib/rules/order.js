'use strict';

var _importType = require('../core/importType');

var _importType2 = _interopRequireDefault(_importType);

var _staticRequire = require('../core/staticRequire');

var _staticRequire2 = _interopRequireDefault(_staticRequire);

var _docsUrl = require('../docsUrl');

var _docsUrl2 = _interopRequireDefault(_docsUrl);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const defaultGroups = ['builtin', 'external', 'parent', 'sibling', 'index'];

// REPORTING AND FIXING

function reverse(array) {
  return array.map(function (v) {
    return {
      name: v.name,
      rank: -v.rank,
      node: v.node
    };
  }).reverse();
}

function getTokensOrCommentsAfter(sourceCode, node, count) {
  let currentNodeOrToken = node;
  const result = [];
  for (let i = 0; i < count; i++) {
    currentNodeOrToken = sourceCode.getTokenOrCommentAfter(currentNodeOrToken);
    if (currentNodeOrToken == null) {
      break;
    }
    result.push(currentNodeOrToken);
  }
  return result;
}

function getTokensOrCommentsBefore(sourceCode, node, count) {
  let currentNodeOrToken = node;
  const result = [];
  for (let i = 0; i < count; i++) {
    currentNodeOrToken = sourceCode.getTokenOrCommentBefore(currentNodeOrToken);
    if (currentNodeOrToken == null) {
      break;
    }
    result.push(currentNodeOrToken);
  }
  return result.reverse();
}

function takeTokensAfterWhile(sourceCode, node, condition) {
  const tokens = getTokensOrCommentsAfter(sourceCode, node, 100);
  const result = [];
  for (let i = 0; i < tokens.length; i++) {
    if (condition(tokens[i])) {
      result.push(tokens[i]);
    } else {
      break;
    }
  }
  return result;
}

function takeTokensBeforeWhile(sourceCode, node, condition) {
  const tokens = getTokensOrCommentsBefore(sourceCode, node, 100);
  const result = [];
  for (let i = tokens.length - 1; i >= 0; i--) {
    if (condition(tokens[i])) {
      result.push(tokens[i]);
    } else {
      break;
    }
  }
  return result.reverse();
}

function findOutOfOrder(imported) {
  if (imported.length === 0) {
    return [];
  }
  let maxSeenRankNode = imported[0];
  return imported.filter(function (importedModule) {
    const res = importedModule.rank < maxSeenRankNode.rank;
    if (maxSeenRankNode.rank < importedModule.rank) {
      maxSeenRankNode = importedModule;
    }
    return res;
  });
}

function findRootNode(node) {
  let parent = node;
  while (parent.parent != null && parent.parent.body == null) {
    parent = parent.parent;
  }
  return parent;
}

function findEndOfLineWithComments(sourceCode, node) {
  const tokensToEndOfLine = takeTokensAfterWhile(sourceCode, node, commentOnSameLineAs(node));
  let endOfTokens = tokensToEndOfLine.length > 0 ? tokensToEndOfLine[tokensToEndOfLine.length - 1].range[1] : node.range[1];
  let result = endOfTokens;
  for (let i = endOfTokens; i < sourceCode.text.length; i++) {
    if (sourceCode.text[i] === '\n') {
      result = i + 1;
      break;
    }
    if (sourceCode.text[i] !== ' ' && sourceCode.text[i] !== '\t' && sourceCode.text[i] !== '\r') {
      break;
    }
    result = i + 1;
  }
  return result;
}

function commentOnSameLineAs(node) {
  return token => (token.type === 'Block' || token.type === 'Line') && token.loc.start.line === token.loc.end.line && token.loc.end.line === node.loc.end.line;
}

function findStartOfLineWithComments(sourceCode, node) {
  const tokensToEndOfLine = takeTokensBeforeWhile(sourceCode, node, commentOnSameLineAs(node));
  let startOfTokens = tokensToEndOfLine.length > 0 ? tokensToEndOfLine[0].range[0] : node.range[0];
  let result = startOfTokens;
  for (let i = startOfTokens - 1; i > 0; i--) {
    if (sourceCode.text[i] !== ' ' && sourceCode.text[i] !== '\t') {
      break;
    }
    result = i;
  }
  return result;
}

function isPlainRequireModule(node) {
  if (node.type !== 'VariableDeclaration') {
    return false;
  }
  if (node.declarations.length !== 1) {
    return false;
  }
  const decl = node.declarations[0];
  const result = decl.id && (decl.id.type === 'Identifier' || decl.id.type === 'ObjectPattern') && decl.init != null && decl.init.type === 'CallExpression' && decl.init.callee != null && decl.init.callee.name === 'require' && decl.init.arguments != null && decl.init.arguments.length === 1 && decl.init.arguments[0].type === 'Literal';
  return result;
}

function isPlainImportModule(node) {
  return node.type === 'ImportDeclaration' && node.specifiers != null && node.specifiers.length > 0;
}

function canCrossNodeWhileReorder(node) {
  return isPlainRequireModule(node) || isPlainImportModule(node);
}

function canReorderItems(firstNode, secondNode) {
  const parent = firstNode.parent;
  const firstIndex = parent.body.indexOf(firstNode);
  const secondIndex = parent.body.indexOf(secondNode);
  const nodesBetween = parent.body.slice(firstIndex, secondIndex + 1);
  for (var nodeBetween of nodesBetween) {
    if (!canCrossNodeWhileReorder(nodeBetween)) {
      return false;
    }
  }
  return true;
}

function fixOutOfOrder(context, firstNode, secondNode, order) {
  const sourceCode = context.getSourceCode();

  const firstRoot = findRootNode(firstNode.node);
  let firstRootStart = findStartOfLineWithComments(sourceCode, firstRoot);
  const firstRootEnd = findEndOfLineWithComments(sourceCode, firstRoot);

  const secondRoot = findRootNode(secondNode.node);
  let secondRootStart = findStartOfLineWithComments(sourceCode, secondRoot);
  let secondRootEnd = findEndOfLineWithComments(sourceCode, secondRoot);
  const canFix = canReorderItems(firstRoot, secondRoot);

  let newCode = sourceCode.text.substring(secondRootStart, secondRootEnd);
  if (newCode[newCode.length - 1] !== '\n') {
    newCode = newCode + '\n';
  }

  const message = '`' + secondNode.name + '` import should occur ' + order + ' import of `' + firstNode.name + '`';

  if (order === 'before') {
    context.report({
      node: secondNode.node,
      message: message,
      fix: canFix && (fixer => fixer.replaceTextRange([firstRootStart, secondRootEnd], newCode + sourceCode.text.substring(firstRootStart, secondRootStart)))
    });
  } else if (order === 'after') {
    context.report({
      node: secondNode.node,
      message: message,
      fix: canFix && (fixer => fixer.replaceTextRange([secondRootStart, firstRootEnd], sourceCode.text.substring(secondRootEnd, firstRootEnd) + newCode))
    });
  }
}

function reportOutOfOrder(context, imported, outOfOrder, order) {
  outOfOrder.forEach(function (imp) {
    const found = imported.find(function hasHigherRank(importedItem) {
      return importedItem.rank > imp.rank;
    });
    fixOutOfOrder(context, found, imp, order);
  });
}

function makeOutOfOrderReport(context, imported) {
  const outOfOrder = findOutOfOrder(imported);
  if (!outOfOrder.length) {
    return;
  }
  // There are things to report. Try to minimize the number of reported errors.
  const reversedImported = reverse(imported);
  const reversedOrder = findOutOfOrder(reversedImported);
  if (reversedOrder.length < outOfOrder.length) {
    reportOutOfOrder(context, reversedImported, reversedOrder, 'after');
    return;
  }
  reportOutOfOrder(context, imported, outOfOrder, 'before');
}

// DETECTING

function computeRank(context, ranks, name, type) {
  return ranks[(0, _importType2.default)(name, context)] + (type === 'import' ? 0 : 100);
}

function registerNode(context, node, name, type, ranks, imported) {
  const rank = computeRank(context, ranks, name, type);
  if (rank !== -1) {
    imported.push({ name, rank, node });
  }
}

function isInVariableDeclarator(node) {
  return node && (node.type === 'VariableDeclarator' || isInVariableDeclarator(node.parent));
}

const types = ['builtin', 'external', 'internal', 'unknown', 'parent', 'sibling', 'index'];

// Creates an object with type-rank pairs.
// Example: { index: 0, sibling: 1, parent: 1, external: 1, builtin: 2, internal: 2 }
// Will throw an error if it contains a type that does not exist, or has a duplicate
function convertGroupsToRanks(groups) {
  const rankObject = groups.reduce(function (res, group, index) {
    if (typeof group === 'string') {
      group = [group];
    }
    group.forEach(function (groupItem) {
      if (types.indexOf(groupItem) === -1) {
        throw new Error('Incorrect configuration of the rule: Unknown type `' + JSON.stringify(groupItem) + '`');
      }
      if (res[groupItem] !== undefined) {
        throw new Error('Incorrect configuration of the rule: `' + groupItem + '` is duplicated');
      }
      res[groupItem] = index;
    });
    return res;
  }, {});

  const omittedTypes = types.filter(function (type) {
    return rankObject[type] === undefined;
  });

  return omittedTypes.reduce(function (res, type) {
    res[type] = groups.length;
    return res;
  }, rankObject);
}

function fixNewLineAfterImport(context, previousImport) {
  const prevRoot = findRootNode(previousImport.node);
  const tokensToEndOfLine = takeTokensAfterWhile(context.getSourceCode(), prevRoot, commentOnSameLineAs(prevRoot));

  let endOfLine = prevRoot.range[1];
  if (tokensToEndOfLine.length > 0) {
    endOfLine = tokensToEndOfLine[tokensToEndOfLine.length - 1].range[1];
  }
  return fixer => fixer.insertTextAfterRange([prevRoot.range[0], endOfLine], '\n');
}

function removeNewLineAfterImport(context, currentImport, previousImport) {
  const sourceCode = context.getSourceCode();
  const prevRoot = findRootNode(previousImport.node);
  const currRoot = findRootNode(currentImport.node);
  const rangeToRemove = [findEndOfLineWithComments(sourceCode, prevRoot), findStartOfLineWithComments(sourceCode, currRoot)];
  if (/^\s*$/.test(sourceCode.text.substring(rangeToRemove[0], rangeToRemove[1]))) {
    return fixer => fixer.removeRange(rangeToRemove);
  }
  return undefined;
}

function makeNewlinesBetweenReport(context, imported, newlinesBetweenImports) {
  const getNumberOfEmptyLinesBetween = (currentImport, previousImport) => {
    const linesBetweenImports = context.getSourceCode().lines.slice(previousImport.node.loc.end.line, currentImport.node.loc.start.line - 1);

    return linesBetweenImports.filter(line => !line.trim().length).length;
  };
  let previousImport = imported[0];

  imported.slice(1).forEach(function (currentImport) {
    const emptyLinesBetween = getNumberOfEmptyLinesBetween(currentImport, previousImport);

    if (newlinesBetweenImports === 'always' || newlinesBetweenImports === 'always-and-inside-groups') {
      if (currentImport.rank !== previousImport.rank && emptyLinesBetween === 0) {
        context.report({
          node: previousImport.node,
          message: 'There should be at least one empty line between import groups',
          fix: fixNewLineAfterImport(context, previousImport, currentImport)
        });
      } else if (currentImport.rank === previousImport.rank && emptyLinesBetween > 0 && newlinesBetweenImports !== 'always-and-inside-groups') {
        context.report({
          node: previousImport.node,
          message: 'There should be no empty line within import group',
          fix: removeNewLineAfterImport(context, currentImport, previousImport)
        });
      }
    } else if (emptyLinesBetween > 0) {
      context.report({
        node: previousImport.node,
        message: 'There should be no empty line between import groups',
        fix: removeNewLineAfterImport(context, currentImport, previousImport)
      });
    }

    previousImport = currentImport;
  });
}

module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      url: (0, _docsUrl2.default)('order')
    },

    fixable: 'code',
    schema: [{
      type: 'object',
      properties: {
        groups: {
          type: 'array'
        },
        'newlines-between': {
          enum: ['ignore', 'always', 'always-and-inside-groups', 'never']
        }
      },
      additionalProperties: false
    }]
  },

  create: function importOrderRule(context) {
    const options = context.options[0] || {};
    const newlinesBetweenImports = options['newlines-between'] || 'ignore';
    let ranks;

    try {
      ranks = convertGroupsToRanks(options.groups || defaultGroups);
    } catch (error) {
      // Malformed configuration
      return {
        Program: function (node) {
          context.report(node, error.message);
        }
      };
    }
    let imported = [];
    let level = 0;

    function incrementLevel() {
      level++;
    }
    function decrementLevel() {
      level--;
    }

    return {
      ImportDeclaration: function handleImports(node) {
        if (node.specifiers.length) {
          // Ignoring unassigned imports
          const name = node.source.value;
          registerNode(context, node, name, 'import', ranks, imported);
        }
      },
      CallExpression: function handleRequires(node) {
        if (level !== 0 || !(0, _staticRequire2.default)(node) || !isInVariableDeclarator(node.parent)) {
          return;
        }
        const name = node.arguments[0].value;
        registerNode(context, node, name, 'require', ranks, imported);
      },
      'Program:exit': function reportAndReset() {
        makeOutOfOrderReport(context, imported);

        if (newlinesBetweenImports !== 'ignore') {
          makeNewlinesBetweenReport(context, imported, newlinesBetweenImports);
        }

        imported = [];
      },
      FunctionDeclaration: incrementLevel,
      FunctionExpression: incrementLevel,
      ArrowFunctionExpression: incrementLevel,
      BlockStatement: incrementLevel,
      ObjectExpression: incrementLevel,
      'FunctionDeclaration:exit': decrementLevel,
      'FunctionExpression:exit': decrementLevel,
      'ArrowFunctionExpression:exit': decrementLevel,
      'BlockStatement:exit': decrementLevel,
      'ObjectExpression:exit': decrementLevel
    };
  }
};
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9ydWxlcy9vcmRlci5qcyJdLCJuYW1lcyI6WyJkZWZhdWx0R3JvdXBzIiwicmV2ZXJzZSIsImFycmF5IiwibWFwIiwidiIsIm5hbWUiLCJyYW5rIiwibm9kZSIsImdldFRva2Vuc09yQ29tbWVudHNBZnRlciIsInNvdXJjZUNvZGUiLCJjb3VudCIsImN1cnJlbnROb2RlT3JUb2tlbiIsInJlc3VsdCIsImkiLCJnZXRUb2tlbk9yQ29tbWVudEFmdGVyIiwicHVzaCIsImdldFRva2Vuc09yQ29tbWVudHNCZWZvcmUiLCJnZXRUb2tlbk9yQ29tbWVudEJlZm9yZSIsInRha2VUb2tlbnNBZnRlcldoaWxlIiwiY29uZGl0aW9uIiwidG9rZW5zIiwibGVuZ3RoIiwidGFrZVRva2Vuc0JlZm9yZVdoaWxlIiwiZmluZE91dE9mT3JkZXIiLCJpbXBvcnRlZCIsIm1heFNlZW5SYW5rTm9kZSIsImZpbHRlciIsImltcG9ydGVkTW9kdWxlIiwicmVzIiwiZmluZFJvb3ROb2RlIiwicGFyZW50IiwiYm9keSIsImZpbmRFbmRPZkxpbmVXaXRoQ29tbWVudHMiLCJ0b2tlbnNUb0VuZE9mTGluZSIsImNvbW1lbnRPblNhbWVMaW5lQXMiLCJlbmRPZlRva2VucyIsInJhbmdlIiwidGV4dCIsInRva2VuIiwidHlwZSIsImxvYyIsInN0YXJ0IiwibGluZSIsImVuZCIsImZpbmRTdGFydE9mTGluZVdpdGhDb21tZW50cyIsInN0YXJ0T2ZUb2tlbnMiLCJpc1BsYWluUmVxdWlyZU1vZHVsZSIsImRlY2xhcmF0aW9ucyIsImRlY2wiLCJpZCIsImluaXQiLCJjYWxsZWUiLCJhcmd1bWVudHMiLCJpc1BsYWluSW1wb3J0TW9kdWxlIiwic3BlY2lmaWVycyIsImNhbkNyb3NzTm9kZVdoaWxlUmVvcmRlciIsImNhblJlb3JkZXJJdGVtcyIsImZpcnN0Tm9kZSIsInNlY29uZE5vZGUiLCJmaXJzdEluZGV4IiwiaW5kZXhPZiIsInNlY29uZEluZGV4Iiwibm9kZXNCZXR3ZWVuIiwic2xpY2UiLCJub2RlQmV0d2VlbiIsImZpeE91dE9mT3JkZXIiLCJjb250ZXh0Iiwib3JkZXIiLCJnZXRTb3VyY2VDb2RlIiwiZmlyc3RSb290IiwiZmlyc3RSb290U3RhcnQiLCJmaXJzdFJvb3RFbmQiLCJzZWNvbmRSb290Iiwic2Vjb25kUm9vdFN0YXJ0Iiwic2Vjb25kUm9vdEVuZCIsImNhbkZpeCIsIm5ld0NvZGUiLCJzdWJzdHJpbmciLCJtZXNzYWdlIiwicmVwb3J0IiwiZml4IiwiZml4ZXIiLCJyZXBsYWNlVGV4dFJhbmdlIiwicmVwb3J0T3V0T2ZPcmRlciIsIm91dE9mT3JkZXIiLCJmb3JFYWNoIiwiaW1wIiwiZm91bmQiLCJmaW5kIiwiaGFzSGlnaGVyUmFuayIsImltcG9ydGVkSXRlbSIsIm1ha2VPdXRPZk9yZGVyUmVwb3J0IiwicmV2ZXJzZWRJbXBvcnRlZCIsInJldmVyc2VkT3JkZXIiLCJjb21wdXRlUmFuayIsInJhbmtzIiwicmVnaXN0ZXJOb2RlIiwiaXNJblZhcmlhYmxlRGVjbGFyYXRvciIsInR5cGVzIiwiY29udmVydEdyb3Vwc1RvUmFua3MiLCJncm91cHMiLCJyYW5rT2JqZWN0IiwicmVkdWNlIiwiZ3JvdXAiLCJpbmRleCIsImdyb3VwSXRlbSIsIkVycm9yIiwiSlNPTiIsInN0cmluZ2lmeSIsInVuZGVmaW5lZCIsIm9taXR0ZWRUeXBlcyIsImZpeE5ld0xpbmVBZnRlckltcG9ydCIsInByZXZpb3VzSW1wb3J0IiwicHJldlJvb3QiLCJlbmRPZkxpbmUiLCJpbnNlcnRUZXh0QWZ0ZXJSYW5nZSIsInJlbW92ZU5ld0xpbmVBZnRlckltcG9ydCIsImN1cnJlbnRJbXBvcnQiLCJjdXJyUm9vdCIsInJhbmdlVG9SZW1vdmUiLCJ0ZXN0IiwicmVtb3ZlUmFuZ2UiLCJtYWtlTmV3bGluZXNCZXR3ZWVuUmVwb3J0IiwibmV3bGluZXNCZXR3ZWVuSW1wb3J0cyIsImdldE51bWJlck9mRW1wdHlMaW5lc0JldHdlZW4iLCJsaW5lc0JldHdlZW5JbXBvcnRzIiwibGluZXMiLCJ0cmltIiwiZW1wdHlMaW5lc0JldHdlZW4iLCJtb2R1bGUiLCJleHBvcnRzIiwibWV0YSIsImRvY3MiLCJ1cmwiLCJmaXhhYmxlIiwic2NoZW1hIiwicHJvcGVydGllcyIsImVudW0iLCJhZGRpdGlvbmFsUHJvcGVydGllcyIsImNyZWF0ZSIsImltcG9ydE9yZGVyUnVsZSIsIm9wdGlvbnMiLCJlcnJvciIsIlByb2dyYW0iLCJsZXZlbCIsImluY3JlbWVudExldmVsIiwiZGVjcmVtZW50TGV2ZWwiLCJJbXBvcnREZWNsYXJhdGlvbiIsImhhbmRsZUltcG9ydHMiLCJzb3VyY2UiLCJ2YWx1ZSIsIkNhbGxFeHByZXNzaW9uIiwiaGFuZGxlUmVxdWlyZXMiLCJyZXBvcnRBbmRSZXNldCIsIkZ1bmN0aW9uRGVjbGFyYXRpb24iLCJGdW5jdGlvbkV4cHJlc3Npb24iLCJBcnJvd0Z1bmN0aW9uRXhwcmVzc2lvbiIsIkJsb2NrU3RhdGVtZW50IiwiT2JqZWN0RXhwcmVzc2lvbiJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7Ozs7QUFDQTs7OztBQUNBOzs7Ozs7QUFFQSxNQUFNQSxnQkFBZ0IsQ0FBQyxTQUFELEVBQVksVUFBWixFQUF3QixRQUF4QixFQUFrQyxTQUFsQyxFQUE2QyxPQUE3QyxDQUF0Qjs7QUFFQTs7QUFFQSxTQUFTQyxPQUFULENBQWlCQyxLQUFqQixFQUF3QjtBQUN0QixTQUFPQSxNQUFNQyxHQUFOLENBQVUsVUFBVUMsQ0FBVixFQUFhO0FBQzVCLFdBQU87QUFDTEMsWUFBTUQsRUFBRUMsSUFESDtBQUVMQyxZQUFNLENBQUNGLEVBQUVFLElBRko7QUFHTEMsWUFBTUgsRUFBRUc7QUFISCxLQUFQO0FBS0QsR0FOTSxFQU1KTixPQU5JLEVBQVA7QUFPRDs7QUFFRCxTQUFTTyx3QkFBVCxDQUFrQ0MsVUFBbEMsRUFBOENGLElBQTlDLEVBQW9ERyxLQUFwRCxFQUEyRDtBQUN6RCxNQUFJQyxxQkFBcUJKLElBQXpCO0FBQ0EsUUFBTUssU0FBUyxFQUFmO0FBQ0EsT0FBSyxJQUFJQyxJQUFJLENBQWIs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c0IzRCxJQUF0QixFQUE0QkYsSUFBNUIsRUFBa0MsU0FBbEMsRUFBNkMwRixLQUE3QyxFQUFvRHZFLFFBQXBEO0FBQ0QsT0FiSTtBQWNMLHNCQUFnQixTQUFTaUksY0FBVCxHQUEwQjtBQUN4QzlELDZCQUFxQnpCLE9BQXJCLEVBQThCMUMsUUFBOUI7O0FBRUEsWUFBSW1HLDJCQUEyQixRQUEvQixFQUF5QztBQUN2Q0Qsb0NBQTBCeEQsT0FBMUIsRUFBbUMxQyxRQUFuQyxFQUE2Q21HLHNCQUE3QztBQUNEOztBQUVEbkcsbUJBQVcsRUFBWDtBQUNELE9BdEJJO0FBdUJMa0ksMkJBQXFCVCxjQXZCaEI7QUF3QkxVLDBCQUFvQlYsY0F4QmY7QUF5QkxXLCtCQUF5QlgsY0F6QnBCO0FBMEJMWSxzQkFBZ0JaLGNBMUJYO0FBMkJMYSx3QkFBa0JiLGNBM0JiO0FBNEJMLGtDQUE0QkMsY0E1QnZCO0FBNkJMLGlDQUEyQkEsY0E3QnRCO0FBOEJMLHNDQUFnQ0EsY0E5QjNCO0FBK0JMLDZCQUF1QkEsY0EvQmxCO0FBZ0NMLCtCQUF5QkE7QUFoQ3BCLEtBQVA7QUFrQ0Q7QUF4RmMsQ0FBakIiLCJmaWxlIjoib3JkZXIuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIHN0cmljdCdcclxuXHJcbmltcG9ydCBpbXBvcnRUeXBlIGZyb20gJy4uL2NvcmUvaW1wb3J0VHlwZSdcclxuaW1wb3J0IGlzU3RhdGljUmVxdWlyZSBmcm9tICcuLi9jb3JlL3N0YXRpY1JlcXVpcmUnXHJcbmltcG9ydCBkb2NzVXJsIGZyb20gJy4uL2RvY3NVcmwnXHJcblxyXG5jb25zdCBkZWZhdWx0R3JvdXBzID0gWydidWlsdGluJywgJ2V4dGVybmFsJywgJ3BhcmVudCcsICdzaWJsaW5nJywgJ2luZGV4J11cclxuXHJcbi8vIFJFUE9SVElORyBBTkQgRklYSU5HXHJcblxyXG5mdW5jdGlvbiByZXZlcnNlKGFycmF5KSB7XHJcbiAgcmV0dXJuIGFycmF5Lm1hcChmdW5jdGlvbiAodikge1xyXG4gICAgcmV0dXJuIHtcclxuICAgICAgbmFtZTogdi5uYW1lLFxyXG4gICAgICByYW5rOiAtdi5yYW5rLFxyXG4gICAgICBub2RlOiB2Lm5vZGUsXHJcbiAgICB9XHJcbiAgfSkucmV2ZXJzZSgpXHJcbn1cclxuXHJcbmZ1bmN0aW9uIGdldFRva2Vuc09yQ29tbWVudHNBZnRlcihzb3VyY2VDb2RlLCBub2RlLCBjb3VudCkge1xyXG4gIGxldCBjdXJyZW50Tm9kZU9yVG9rZW4gPSBub2RlXHJcbiAgY29uc3QgcmVzdWx0ID0gW11cclxuICBmb3IgKGxldCBpID0gMDsgaSA8IGNvdW50OyBpKyspIHtcclxuICAgIGN1cnJlbnROb2RlT3JUb2tlbiA9IHNvdXJjZUNvZGUuZ2V0VG9rZW5PckNvbW1lbnRBZnRlcihjdXJyZW50Tm9kZU9yVG9rZW4pXHJcbiAgICBpZiAoY3VycmVudE5vZGVPclRva2VuID09IG51bGwpIHtcclxuICAgICAgYnJlYWtcclxuICAgIH1cclxuICAgIHJlc3VsdC5wdXNoKGN1cnJlbnROb2RlT3JUb2tlbilcclxuICB9XHJcbiAgcmV0dXJuIHJlc3VsdFxyXG59XHJcblxyXG5mdW5jdGlvbiBnZXRUb2tlbnNPckNvbW1lbnRzQmVmb3JlKHNvdXJjZUNvZGUsIG5vZGUsIGNvdW50KSB7XHJcbiAgbGV0IGN1cnJlbnROb2RlT3JUb2tlbiA9IG5vZGVcclxuICBjb25zdCByZXN1bHQgPSBbXVxyXG4gIGZvciAobGV0IGkgPSAwOyBpIDwgY291bnQ7IGkrKykge1xyXG4gICAgY3VycmVudE5vZGVPclRva2VuID0gc291cmNlQ29kZS5nZXRUb2tlbk9yQ29tbWVudEJlZm9yZShjdXJyZW50Tm9kZU9yVG9rZW4pXHJcbiAgICBpZiAoY3VycmVudE5vZGVPclRva2VuID09IG51bGwpIHtcclxuICAgICAgYnJlYWtcclxuICAgIH1cclxuICAgIHJlc3VsdC5wdXNoKGN1cnJlbnROb2RlT3JUb2tlbilcclxuICB9XHJcbiAgcmV0dXJuIHJlc3VsdC5yZXZlcnNlKClcclxufVxyXG5cclxuZnVuY3Rpb24gdGFrZVRva2Vuc0FmdGVyV2hpbGUoc291cmNlQ29kZSwgbm9kZSwgY29uZGl0aW9uKSB7XHJcbiAgY29uc3QgdG9rZW5zID0gZ2V0VG9rZW5zT3JDb21tZW50c0FmdGVyKHNvdXJjZUNvZGUsIG5vZGUsIDEwMClcclxuICBjb25zdCByZXN1bHQgPSBbXVxyXG4gIGZvciAobGV0IGkgPSAwOyBpIDwgdG9rZW5zLmxlbmd0aDsgaSsrKSB7XHJcbiAgICBpZiAoY29uZGl0aW9uKHRva2Vuc1tpXSkpIHtcclxuICAgICAgcmVzdWx0LnB1c2godG9rZW5zW2ldKVxyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcbiAgICAgIGJyZWFrXHJcbiAgICB9XHJcbiAgfVxyXG4gIHJldHVybiByZXN1bHRcclxufVxyXG5cclxuZnVuY3Rpb24gdGFrZVRva2Vuc0JlZm9yZVdoaWxlKHNvdXJjZUNvZGUsIG5vZGUsIGNvbmRpdGlvbikge1xyXG4gIGNvbnN0IHRva2VucyA9IGdldFRva2Vuc09yQ29tbWVudHNCZWZvcmUoc291cmNlQ29kZSwgbm9kZSwgMTAwKVxyXG4gIGNvbnN0IHJlc3VsdCA9IFtdXHJcbiAgZm9yIChsZXQgaSA9IHRva2Vucy5sZW5ndGggLSAxOyBpID49IDA7IGktLSkge1xyXG4gICAgaWYgKGNvbmRpdGlvbih0b2tlbnNbaV0pKSB7XHJcbiAgICAgIHJlc3VsdC5wdXNoKHRva2Vuc1tpXSlcclxuICAgIH1cclxuICAgIGVsc2Uge1xyXG4gICAgICBicmVha1xyXG4gICAgfVxyXG4gIH1cclxuICByZXR1cm4gcmVzdWx0LnJldmVyc2UoKVxyXG59XHJcblxyXG5mdW5jdGlvbiBmaW5kT3V0T2ZPcmRlcihpbXBvcnRlZCkge1xyXG4gIGlmIChpbXBvcnRlZC5sZW5ndGggPT09IDApIHtcclxuICAgIHJldHVybiBbXVxyXG4gIH1cclxuICBsZXQgbWF4U2VlblJhbmtOb2RlID0gaW1wb3J0ZWRbMF1cclxuICByZXR1cm4gaW1wb3J0ZWQuZmlsdGVyKGZ1bmN0aW9uIChpbXBvcnRlZE1vZHVsZSkge1xyXG4gICAgY29uc3QgcmVzID0gaW1wb3J0ZWRNb2R1bGUucmFuayA8IG1heFNlZW5SYW5rTm9kZS5yYW5rXHJcbiAgICBpZiAobWF4U2VlblJhbmtOb2RlLnJhbmsgPCBpbXBvcnRlZE1vZHVsZS5yYW5rKSB7XHJcbiAgICAgIG1heFNlZW5SYW5rTm9kZSA9IGltcG9ydGVkTW9kdWxlXHJcbiAgICB9XHJcbiAgICByZXR1cm4gcmVzXHJcbiAgfSlcclxufVxyXG5cclxuZnVuY3Rpb24gZmluZFJvb3ROb2RlKG5vZGUpIHtcclxuICBsZXQgcGFyZW50ID0gbm9kZVxyXG4gIHdoaWxlIChwYXJlbnQucGFyZW50ICE9IG51bGwgJiYgcGFyZW50LnBhcmVudC5ib2R5ID09IG51bGwpIHtcclxuICAgIHBhcmVudCA9IHBhcmVudC5wYXJlbnRcclxuICB9XHJcbiAgcmV0dXJuIHBhcmVudFxyXG59XHJcblxyXG5mdW5jdGlvbiBmaW5kRW5kT2ZMaW5lV2l0aENvbW1lbnRzKHNvdXJjZUNvZGUsIG5vZGUpIHtcclxuICBjb25zdCB0b2tlbnNUb0VuZE9mTGluZSA9IHRha2VUb2tlbnNBZnRlcldoaWxlKHNvdXJjZUNvZGUsIG5vZGUsIGNvbW1lbnRPblNhbWVMaW5lQXMobm9kZSkpXHJcbiAgbGV0IGVuZE9mVG9rZW5zID0gdG9rZW5zVG9FbmRPZkxpbmUubGVuZ3RoID4gMFxyXG4gICAgPyB0b2tlbnNUb0VuZE9mTGluZVt0b2tlbnNUb0VuZE9mTGluZS5sZW5ndGggLSAxXS5yYW5nZVsxXVxyXG4gICAgOiBub2RlLnJhbmdlWzFdXHJcbiAgbGV0IHJlc3VsdCA9IGVuZE9mVG9rZW5zXHJcbiAgZm9yIChsZXQgaSA9IGVuZE9mVG9rZW5zOyBpIDwgc291cmNlQ29kZS50ZXh0Lmxlbmd0aDsgaSsrKSB7XHJcbiAgICBpZiAoc291cmNlQ29kZS50ZXh0W2ldID09PSAnXFxuJykge1xyXG4gICAgICByZXN1bHQgPSBpICsgMVxyXG4gICAgICBicmVha1xyXG4gICAgfVxyXG4gICAgaWYgKHNvdXJjZUNvZGUudGV4dFtpXSAhPT0gJyAnICYmIHNvdXJjZUNvZGUudGV4dFtpXSAhPT0gJ1xcdCcgJiYgc291cmNlQ29kZS50ZXh0W2ldICE9PSAnXFxyJykge1xyXG4gICAgICBicmVha1xyXG4gICAgfVxyXG4gICAgcmVzdWx0ID0gaSArIDFcclxuICB9XHJcbiAgcmV0dXJuIHJlc3VsdFxyXG59XHJcblxyXG5mdW5jdGlvbiBjb21tZW50T25TYW1lTGluZUFzKG5vZGUpIHtcclxuICByZXR1cm4gdG9rZW4gPT4gKHRva2VuLnR5cGUgPT09ICdCbG9jaycgfHwgIHRva2VuLnR5cGUgPT09ICdMaW5lJykgJiZcclxuICAgICAgdG9rZW4ubG9jLnN0YXJ0LmxpbmUgPT09IHRva2VuLmxvYy5lbmQubGluZSAmJlxyXG4gICAgICB0b2tlbi5sb2MuZW5kLmxpbmUgPT09IG5vZGUubG9jLmVuZC5saW5lXHJcbn1cclxuXHJcbmZ1bmN0aW9uIGZpbmRTdGFydE9mTGluZVdpdGhDb21tZW50cyhzb3VyY2VDb2RlLCBub2RlKSB7XHJcbiAgY29uc3QgdG9rZW5zVG9FbmRPZkxpbmUgPSB0YWtlVG9rZW5zQmVmb3JlV2hpbGUoc291cmNlQ29kZSwgbm9kZSwgY29tbWVudE9uU2FtZUxpbmVBcyhub2RlKSlcclxuICBsZXQgc3RhcnRPZlRva2VucyA9IHRva2Vuc1RvRW5kT2ZMaW5lLmxlbmd0aCA+IDAgPyB0b2tlbnNUb0VuZE9mTGluZVswXS5yYW5nZVswXSA6IG5vZGUucmFuZ2VbMF1cclxuICBsZXQgcmVzdWx0ID0gc3RhcnRPZlRva2Vuc1xyXG4gIGZvciAobGV0IGkgPSBzdGFydE9mVG9rZW5zIC0gMTsgaSA+IDA7IGktLSkge1xyXG4gICAgaWYgKHNvdXJjZUNvZGUudGV4dFtpXSAhPT0gJyAnICYmIHNvdXJjZUNvZGUudGV4dFtpXSAhPT0gJ1xcdCcpIHtcclxuICAgICAgYnJlYWtcclxuICAgIH1cclxuICAgIHJlc3VsdCA9IGlcclxuICB9XHJcbiAgcmV0dXJuIHJlc3VsdFxyXG59XHJcblxyXG5mdW5jdGlvbiBpc1BsYWluUmVxdWlyZU1vZHVsZShub2RlKSB7XHJcbiAgaWYgKG5vZGUudHlwZSAhPT0gJ1ZhcmlhYmxlRGVjbGFyYXRpb24nKSB7XHJcbiAgICByZXR1cm4gZmFsc2VcclxuICB9XHJcbiAgaWYgKG5vZGUuZGVjbGFyYXRpb25zLmxlbmd0aCAhPT0gMSkge1xyXG4gICAgcmV0dXJuIGZhbHNlXHJcbiAgfVxyXG4gIGNvbnN0IGRlY2wgPSBub2RlLmRlY2xhcmF0aW9uc1swXVxyXG4gIGNvbnN0IHJlc3VsdCA9IGRlY2wuaWQgJiZcclxuICAgIChkZWNsLmlkLnR5cGUgPT09ICdJZGVudGlmaWVyJyB8fCBkZWNsLmlkLnR5cGUgPT09ICdPYmplY3RQYXR0ZXJuJykgJiZcclxuICAgIGRlY2wuaW5pdCAhPSBudWxsICYmXHJcbiAgICBkZWNsLmluaXQudHlwZSA9PT0gJ0NhbGxFeHByZXNzaW9uJyAmJlxyXG4gICAgZGVjbC5pbml0LmNhbGxlZSAhPSBudWxsICYmXHJcbiAgICBkZWNsLmluaXQuY2FsbGVlLm5hbWUgPT09ICdyZXF1aXJlJyAmJlxyXG4gICAgZGVjbC5pbml0LmFyZ3VtZW50cyAhPSBudWxsICYmXHJcbiAgICBkZWNsLmluaXQuYXJndW1lbnRzLmxlbmd0aCA9PT0gMSAmJlxyXG4gICAgZGVjbC5pbml0LmFyZ3VtZW50c1swXS50eXBlID09PSAnTGl0ZXJhbCdcclxuICByZXR1cm4gcmVzdWx0XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGlzUGxhaW5JbXBvcnRNb2R1bGUobm9kZSkge1xyXG4gIHJldHVybiBub2RlLnR5cGUgPT09ICdJbXBvcnREZWNsYXJhdGlvbicgJiYgbm9kZS5zcGVjaWZpZXJzICE9IG51bGwgJiYgbm9kZS5zcGVjaWZpZXJzLmxlbmd0aCA+IDBcclxufVxyXG5cclxuZnVuY3Rpb24gY2FuQ3Jvc3NOb2RlV2hpbGVSZW9yZGVyKG5vZGUpIHtcclxuICByZXR1cm4gaXNQbGFpblJlcXVpcmVNb2R1bGUobm9kZSkgfHwgaXNQbGFpbkltcG9ydE1vZHVsZShub2RlKVxyXG59XHJcblxyXG5mdW5jdGlvbiBjYW5SZW9yZGVySXRlbXMoZmlyc3ROb2RlLCBzZWNvbmROb2RlKSB7XHJcbiAgY29uc3QgcGFyZW50ID0gZmlyc3ROb2RlLnBhcmVudFxyXG4gIGNvbnN0IGZpcnN0SW5kZXggPSBwYXJlbnQuYm9keS5pbmRleE9mKGZpcnN0Tm9kZSlcclxuICBjb25zdCBzZWNvbmRJbmRleCA9IHBhcmVudC5ib2R5LmluZGV4T2Yoc2Vjb25kTm9kZSlcclxuICBjb25zdCBub2Rlc0JldHdlZW4gPSBwYXJlbnQuYm9keS5zbGljZShmaXJzdEluZGV4LCBzZWNvbmRJbmRleCArIDEpXHJcbiAgZm9yICh2YXIgbm9kZUJldHdlZW4gb2Ygbm9kZXNCZXR3ZWVuKSB7XHJcbiAgICBpZiAoIWNhbkNyb3NzTm9kZVdoaWxlUmVvcmRlcihub2RlQmV0d2VlbikpIHtcclxuICAgICAgcmV0dXJuIGZhbHNlXHJcbiAgICB9XHJcbiAgfVxyXG4gIHJldHVybiB0cnVlXHJcbn1cclxuXHJcbmZ1bmN0aW9uIGZpeE91dE9mT3JkZXIoY29udGV4dCwgZmlyc3ROb2RlLCBzZWNvbmROb2RlLCBvcmRlcikge1xyXG4gIGNvbnN0IHNvdXJjZUNvZGUgPSBjb250ZXh0LmdldFNvdXJjZUNvZGUoKVxyXG5cclxuICBjb25zdCBmaXJzdFJvb3QgPSBmaW5kUm9vdE5vZGUoZmlyc3ROb2RlLm5vZGUpXHJcbiAgbGV0IGZpcnN0Um9vdFN0YXJ0ID0gZmluZFN0YXJ0T2ZMaW5lV2l0aENvbW1lbnRzKHNvdXJjZUNvZGUsIGZpcnN0Um9vdClcclxuICBjb25zdCBmaXJzdFJvb3RFbmQgPSBmaW5kRW5kT2ZMaW5lV2l0aENvbW1lbnRzKHNvdXJjZUNvZGUsIGZpcnN0Um9vdClcclxuXHJcbiAgY29uc3Qgc2Vjb25kUm9vdCA9IGZpbmRSb290Tm9kZShzZWNvbmROb2RlLm5vZGUpXHJcbiAgbGV0IHNlY29uZFJvb3RTdGFydCA9IGZpbmRTdGFydE9mTGluZVdpdGhDb21tZW50cyhzb3VyY2VDb2RlLCBzZWNvbmRSb290KVxyXG4gIGxldCBzZWNvbmRSb290RW5kID0gZmluZEVuZE9mTGluZVdpdGhDb21tZW50cyhzb3VyY2VDb2RlLCBzZWNvbmRSb290KVxyXG4gIGNvbnN0IGNhbkZpeCA9IGNhblJlb3JkZXJJdGVtcyhmaXJzdFJvb3QsIHNlY29uZFJvb3QpXHJcblxyXG4gIGxldCBuZXdDb2RlID0gc291cmNlQ29kZS50ZXh0LnN1YnN0cmluZyhzZWNvbmRSb290U3RhcnQsIHNlY29uZFJvb3RFbmQpXHJcbiAgaWYgKG5ld0NvZGVbbmV3Q29kZS5sZW5ndGggLSAxXSAhPT0gJ1xcbicpIHtcclxuICAgIG5ld0NvZGUgPSBuZXdDb2RlICsgJ1xcbidcclxuICB9XHJcblxyXG4gIGNvbnN0IG1lc3NhZ2UgPSAnYCcgKyBzZWNvbmROb2RlLm5hbWUgKyAnYCBpbXBvcnQgc2hvdWxkIG9jY3VyICcgKyBvcmRlciArXHJcbiAgICAgICcgaW1wb3J0IG9mIGAnICsgZmlyc3ROb2RlLm5hbWUgKyAnYCdcclxuXHJcbiAgaWYgKG9yZGVyID09PSAnYmVmb3JlJykge1xyXG4gICAgY29udGV4dC5yZXBvcnQoe1xyXG4gICAgICBub2RlOiBzZWNvbmROb2RlLm5vZGUsXHJcbiAgICAgIG1lc3NhZ2U6IG1lc3NhZ2UsXHJcbiAgICAgIGZpeDogY2FuRml4ICYmIChmaXhlciA9PlxyXG4gICAgICAgIGZpeGVyLnJlcGxhY2VUZXh0UmFuZ2UoXHJcbiAgICAgICAgICBbZmlyc3RSb290U3RhcnQsIHNlY29uZFJvb3RFbmRdLFxyXG4gICAgICAgICAgbmV3Q29kZSArIHNvdXJjZUNvZGUudGV4dC5zdWJzdHJpbmcoZmlyc3RSb290U3RhcnQsIHNlY29uZFJvb3RTdGFydClcclxuICAgICAgICApKSxcclxuICAgIH0pXHJcbiAgfSBlbHNlIGlmIChvcmRlciA9PT0gJ2FmdGVyJykge1xyXG4gICAgY29udGV4dC5yZXBvcnQoe1xyXG4gICAgICBub2RlOiBzZWNvbmROb2RlLm5vZGUsXHJcbiAgICAgIG1lc3NhZ2U6IG1lc3NhZ2UsXHJcbiAgICAgIGZpeDogY2FuRml4ICYmIChmaXhlciA9PlxyXG4gICAgICAgIGZpeGVyLnJlcGxhY2VUZXh0UmFuZ2UoXHJcbiAgICAgICAgICBbc2Vjb25kUm9vdFN0YXJ0LCBmaXJzdFJvb3RFbmRdLFxyXG4gICAgICAgICAgc291cmNlQ29kZS50ZXh0LnN1YnN0cmluZyhzZWNvbmRSb290RW5kLCBmaXJzdFJvb3RFbmQpICsgbmV3Q29kZVxyXG4gICAgICAgICkpLFxyXG4gICAgfSlcclxuICB9XHJcbn1cclxuXHJcbmZ1bmN0aW9uIHJlcG9ydE91dE9mT3JkZXIoY29udGV4dCwgaW1wb3J0ZWQsIG91dE9mT3JkZXIsIG9yZGVyKSB7XHJcbiAgb3V0T2ZPcmRlci5mb3JFYWNoKGZ1bmN0aW9uIChpbXApIHtcclxuICAgIGNvbnN0IGZvdW5kID0gaW1wb3J0ZWQuZmluZChmdW5jdGlvbiBoYXNIaWdoZXJSYW5rKGltcG9ydGVkSXRlbSkge1xyXG4gICAgICByZXR1cm4gaW1wb3J0ZWRJdGVtLnJhbmsgPiBpbXAucmFua1xyXG4gICAgfSlcclxuICAgIGZpeE91dE9mT3JkZXIoY29udGV4dCwgZm91bmQsIGltcCwgb3JkZXIpXHJcbiAgfSlcclxufVxyXG5cclxuZnVuY3Rpb24gbWFrZU91dE9mT3JkZXJSZXBvcnQoY29udGV4dCwgaW1wb3J0ZWQpIHtcclxuICBjb25zdCBvdXRPZk9yZGVyID0gZmluZE91dE9mT3JkZXIoaW1wb3J0ZWQpXHJcbiAgaWYgKCFvdXRPZk9yZGVyLmxlbmd0aCkge1xyXG4gICAgcmV0dXJuXHJcbiAgfVxyXG4gIC8vIFRoZXJlIGFyZSB0aGluZ3MgdG8gcmVwb3J0LiBUcnkgdG8gbWluaW1pemUgdGhlIG51bWJlciBvZiByZXBvcnRlZCBlcnJvcnMuXHJcbiAgY29uc3QgcmV2ZXJzZWRJbXBvcnRlZCA9IHJldmVyc2UoaW1wb3J0ZWQpXHJcbiAgY29uc3QgcmV2ZXJzZWRPcmRlciA9IGZpbmRPdXRPZk9yZGVyKHJldmVyc2VkSW1wb3J0ZWQpXHJcbiAgaWYgKHJldmVyc2VkT3JkZXIubGVuZ3RoIDwgb3V0T2ZPcmRlci5sZW5ndGgpIHtcclxuICAgIHJlcG9ydE91dE9mT3JkZXIoY29udGV4dCwgcmV2ZXJzZWRJbXBvcnRlZCwgcmV2ZXJzZWRPcmRlciwgJ2FmdGVyJylcclxuICAgIHJldHVyblxyXG4gIH1cclxuICByZXBvcnRPdXRPZk9yZGVyKGNvbnRleHQsIGltcG9ydGVkLCBvdXRPZk9yZGVyLCAnYmVmb3JlJylcclxufVxyXG5cclxuLy8gREVURUNUSU5HXHJcblxyXG5mdW5jdGlvbiBjb21wdXRlUmFuayhjb250ZXh0LCByYW5rcywgbmFtZSwgdHlwZSkge1xyXG4gIHJldHVybiByYW5rc1tpbXBvcnRUeXBlKG5hbWUsIGNvbnRleHQpXSArXHJcbiAgICAodHlwZSA9PT0gJ2ltcG9ydCcgPyAwIDogMTAwKVxyXG59XHJcblxyXG5mdW5jdGlvbiByZWdpc3Rlck5vZGUoY29udGV4dCwgbm9kZSwgbmFtZSwgdHlwZSwgcmFua3MsIGltcG9ydGVkKSB7XHJcbiAgY29uc3QgcmFuayA9IGNvbXB1dGVSYW5rKGNvbnRleHQsIHJhbmtzLCBuYW1lLCB0eXBlKVxyXG4gIGlmIChyYW5rICE9PSAtMSkge1xyXG4gICAgaW1wb3J0ZWQucHVzaCh7bmFtZSwgcmFuaywgbm9kZX0pXHJcbiAgfVxyXG59XHJcblxyXG5mdW5jdGlvbiBpc0luVmFyaWFibGVEZWNsYXJhdG9yKG5vZGUpIHtcclxuICByZXR1cm4gbm9kZSAmJlxyXG4gICAgKG5vZGUudHlwZSA9PT0gJ1ZhcmlhYmxlRGVjbGFyYXRvcicgfHwgaXNJblZhcmlhYmxlRGVjbGFyYXRvcihub2RlLnBhcmVudCkpXHJcbn1cclxuXHJcbmNvbnN0IHR5cGVzID0gWydidWlsdGluJywgJ2V4dGVybmFsJywgJ2ludGVybmFsJywgJ3Vua25vd24nLCAncGFyZW50JywgJ3NpYmxpbmcnLCAnaW5kZXgnXVxyXG5cclxuLy8gQ3JlYXRlcyBhbiBvYmplY3Qgd2l0aCB0eXBlLXJhbmsgcGFpcnMuXHJcbi8vIEV4YW1wbGU6IHsgaW5kZXg6IDAsIHNpYmxpbmc6IDEsIHBhcmVudDogMSwgZXh0ZXJuYWw6IDEsIGJ1aWx0aW46IDIsIGludGVybmFsOiAyIH1cclxuLy8gV2lsbCB0aHJvdyBhbiBlcnJvciBpZiBpdCBjb250YWlucyBhIHR5cGUgdGhhdCBkb2VzIG5vdCBleGlzdCwgb3IgaGFzIGEgZHVwbGljYXRlXHJcbmZ1bmN0aW9uIGNvbnZlcnRHcm91cHNUb1JhbmtzKGdyb3Vwcykge1xyXG4gIGNvbnN0IHJhbmtPYmplY3QgPSBncm91cHMucmVkdWNlKGZ1bmN0aW9uKHJlcywgZ3JvdXAsIGluZGV4KSB7XHJcbiAgICBpZiAodHlwZW9mIGdyb3VwID09PSAnc3RyaW5nJykge1xyXG4gICAgICBncm91cCA9IFtncm91cF1cclxuICAgIH1cclxuICAgIGdyb3VwLmZvckVhY2goZnVuY3Rpb24oZ3JvdXBJdGVtKSB7XHJcbiAgICAgIGlmICh0eXBlcy5pbmRleE9mKGdyb3VwSXRlbSkgPT09IC0xKSB7XHJcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdJbmNvcnJlY3QgY29uZmlndXJhdGlvbiBvZiB0aGUgcnVsZTogVW5rbm93biB0eXBlIGAnICtcclxuICAgICAgICAgIEpTT04uc3RyaW5naWZ5KGdyb3VwSXRlbSkgKyAnYCcpXHJcbiAgICAgIH1cclxuICAgICAgaWYgKHJlc1tncm91cEl0ZW1dICE9PSB1bmRlZmluZWQpIHtcclxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0luY29ycmVjdCBjb25maWd1cmF0aW9uIG9mIHRoZSBydWxlOiBgJyArIGdyb3VwSXRlbSArICdgIGlzIGR1cGxpY2F0ZWQnKVxyXG4gICAgICB9XHJcbiAgICAgIHJlc1tncm91cEl0ZW1dID0gaW5kZXhcclxuICAgIH0pXHJcbiAgICByZXR1cm4gcmVzXHJcbiAgfSwge30pXHJcblxyXG4gIGNvbnN0IG9taXR0ZWRUeXBlcyA9IHR5cGVzLmZpbHRlcihmdW5jdGlvbih0eXBlKSB7XHJcbiAgICByZXR1cm4gcmFua09iamVjdFt0eXBlXSA9PT0gdW5kZWZpbmVkXHJcbiAgfSlcclxuXHJcbiAgcmV0dXJuIG9taXR0ZWRUeXBlcy5yZWR1Y2UoZnVuY3Rpb24ocmVzLCB0eXBlKSB7XHJcbiAgICByZXNbdHlwZV0gPSBncm91cHMubGVuZ3RoXHJcbiAgICByZXR1cm4gcmVzXHJcbiAgfSwgcmFua09iamVjdClcclxufVxyXG5cclxuZnVuY3Rpb24gZml4TmV3TGluZUFmdGVySW1wb3J0KGNvbnRleHQsIHByZXZpb3VzSW1wb3J0KSB7XHJcbiAgY29uc3QgcHJldlJvb3QgPSBmaW5kUm9vdE5vZGUocHJldmlvdXNJbXBvcnQubm9kZSlcclxuICBjb25zdCB0b2tlbnNUb0VuZE9mTGluZSA9IHRha2VUb2tlbnNBZnRlcldoaWxlKFxyXG4gICAgY29udGV4dC5nZXRTb3VyY2VDb2RlKCksIHByZXZSb290LCBjb21tZW50T25TYW1lTGluZUFzKHByZXZSb290KSlcclxuXHJcbiAgbGV0IGVuZE9mTGluZSA9IHByZXZSb290LnJhbmdlWzFdXHJcbiAgaWYgKHRva2Vuc1RvRW5kT2ZMaW5lLmxlbmd0aCA+IDApIHtcclxuICAgIGVuZE9mTGluZSA9IHRva2Vuc1RvRW5kT2ZMaW5lW3Rva2Vuc1RvRW5kT2ZMaW5lLmxlbmd0aCAtIDFdLnJhbmdlWzFdXHJcbiAgfVxyXG4gIHJldHVybiAoZml4ZXIpID0+IGZpeGVyLmluc2VydFRleHRBZnRlclJhbmdlKFtwcmV2Um9vdC5yYW5nZVswXSwgZW5kT2ZMaW5lXSwgJ1xcbicpXHJcbn1cclxuXHJcbmZ1bmN0aW9uIHJlbW92ZU5ld0xpbmVBZnRlckltcG9ydChjb250ZXh0LCBjdXJyZW50SW1wb3J0LCBwcmV2aW91c0ltcG9ydCkge1xyXG4gIGNvbnN0IHNvdXJjZUNvZGUgPSBjb250ZXh0LmdldFNvdXJjZUNvZGUoKVxyXG4gIGNvbnN0IHByZXZSb290ID0gZmluZFJvb3ROb2RlKHByZXZpb3VzSW1wb3J0Lm5vZGUpXHJcbiAgY29uc3QgY3VyclJvb3QgPSBmaW5kUm9vdE5vZGUoY3VycmVudEltcG9ydC5ub2RlKVxyXG4gIGNvbnN0IHJhbmdlVG9SZW1vdmUgPSBbXHJcbiAgICBmaW5kRW5kT2ZMaW5lV2l0aENvbW1lbnRzKHNvdXJjZUNvZGUsIHByZXZSb290KSxcclxuICAgIGZpbmRTdGFydE9mTGluZVdpdGhDb21tZW50cyhzb3VyY2VDb2RlLCBjdXJyUm9vdCksXHJcbiAgXVxyXG4gIGlmICgvXlxccyokLy50ZXN0KHNvdXJjZUNvZGUudGV4dC5zdWJzdHJpbmcocmFuZ2VUb1JlbW92ZVswXSwgcmFuZ2VUb1JlbW92ZVsxXSkpKSB7XHJcbiAgICByZXR1cm4gKGZpeGVyKSA9PiBmaXhlci5yZW1vdmVSYW5nZShyYW5nZVRvUmVtb3ZlKVxyXG4gIH1cclxuICByZXR1cm4gdW5kZWZpbmVkXHJcbn1cclxuXHJcbmZ1bmN0aW9uIG1ha2VOZXdsaW5lc0JldHdlZW5SZXBvcnQgKGNvbnRleHQsIGltcG9ydGVkLCBuZXdsaW5lc0JldHdlZW5JbXBvcnRzKSB7XHJcbiAgY29uc3QgZ2V0TnVtYmVyT2ZFbXB0eUxpbmVzQmV0d2VlbiA9IChjdXJyZW50SW1wb3J0LCBwcmV2aW91c0ltcG9ydCkgPT4ge1xyXG4gICAgY29uc3QgbGluZXNCZXR3ZWVuSW1wb3J0cyA9IGNvbnRleHQuZ2V0U291cmNlQ29kZSgpLmxpbmVzLnNsaWNlKFxyXG4gICAgICBwcmV2aW91c0ltcG9ydC5ub2RlLmxvYy5lbmQubGluZSxcclxuICAgICAgY3VycmVudEltcG9ydC5ub2RlLmxvYy5zdGFydC5saW5lIC0gMVxyXG4gICAgKVxyXG5cclxuICAgIHJldHVybiBsaW5lc0JldHdlZW5JbXBvcnRzLmZpbHRlcigobGluZSkgPT4gIWxpbmUudHJpbSgpLmxlbmd0aCkubGVuZ3RoXHJcbiAgfVxyXG4gIGxldCBwcmV2aW91c0ltcG9ydCA9IGltcG9ydGVkWzBdXHJcblxyXG4gIGltcG9ydGVkLnNsaWNlKDEpLmZvckVhY2goZnVuY3Rpb24oY3VycmVudEltcG9ydCkge1xyXG4gICAgY29uc3QgZW1wdHlMaW5lc0JldHdlZW4gPSBnZXROdW1iZXJPZkVtcHR5TGluZXNCZXR3ZWVuKGN1cnJlbnRJbXBvcnQsIHByZXZpb3VzSW1wb3J0KVxyXG5cclxuICAgIGlmIChuZXdsaW5lc0JldHdlZW5JbXBvcnRzID09PSAnYWx3YXlzJ1xyXG4gICAgICAgIHx8IG5ld2xpbmVzQmV0d2VlbkltcG9ydHMgPT09ICdhbHdheXMtYW5kLWluc2lkZS1ncm91cHMnKSB7XHJcbiAgICAgIGlmIChjdXJyZW50SW1wb3J0LnJhbmsgIT09IHByZXZpb3VzSW1wb3J0LnJhbmsgJiYgZW1wdHlMaW5lc0JldHdlZW4gPT09IDApIHtcclxuICAgICAgICBjb250ZXh0LnJlcG9ydCh7XHJcbiAgICAgICAgICBub2RlOiBwcmV2aW91c0ltcG9ydC5ub2RlLFxyXG4gICAgICAgICAgbWVzc2FnZTogJ1RoZXJlIHNob3VsZCBiZSBhdCBsZWFzdCBvbmUgZW1wdHkgbGluZSBiZXR3ZWVuIGltcG9ydCBncm91cHMnLFxyXG4gICAgICAgICAgZml4OiBmaXhOZXdMaW5lQWZ0ZXJJbXBvcnQoY29udGV4dCwgcHJldmlvdXNJbXBvcnQsIGN1cnJlbnRJbXBvcnQpLFxyXG4gICAgICAgIH0pXHJcbiAgICAgIH0gZWxzZSBpZiAoY3VycmVudEltcG9ydC5yYW5rID09PSBwcmV2aW91c0ltcG9ydC5yYW5rXHJcbiAgICAgICAgJiYgZW1wdHlMaW5lc0JldHdlZW4gPiAwXHJcbiAgICAgICAgJiYgbmV3bGluZXNCZXR3ZWVuSW1wb3J0cyAhPT0gJ2Fsd2F5cy1hbmQtaW5zaWRlLWdyb3VwcycpIHtcclxuICAgICAgICBjb250ZXh0LnJlcG9ydCh7XHJcbiAgICAgICAgICBub2RlOiBwcmV2aW91c0ltcG9ydC5ub2RlLFxyXG4gICAgICAgICAgbWVzc2FnZTogJ1RoZXJlIHNob3VsZCBiZSBubyBlbXB0eSBsaW5lIHdpdGhpbiBpbXBvcnQgZ3JvdXAnLFxyXG4gICAgICAgICAgZml4OiByZW1vdmVOZXdMaW5lQWZ0ZXJJbXBvcnQoY29udGV4dCwgY3VycmVudEltcG9ydCwgcHJldmlvdXNJbXBvcnQpLFxyXG4gICAgICAgIH0pXHJcbiAgICAgIH1cclxuICAgIH0gZWxzZSBpZiAoZW1wdHlMaW5lc0JldHdlZW4gPiAwKSB7XHJcbiAgICAgIGNvbnRleHQucmVwb3J0KHtcclxuICAgICAgICBub2RlOiBwcmV2aW91c0ltcG9ydC5ub2RlLFxyXG4gICAgICAgIG1lc3NhZ2U6ICdUaGVyZSBzaG91bGQgYmUgbm8gZW1wdHkgbGluZSBiZXR3ZWVuIGltcG9ydCBncm91cHMnLFxyXG4gICAgICAgIGZpeDogcmVtb3ZlTmV3TGluZUFmdGVySW1wb3J0KGNvbnRleHQsIGN1cnJlbnRJbXBvcnQsIHByZXZpb3VzSW1wb3J0KSxcclxuICAgICAgfSlcclxuICAgIH1cclxuXHJcbiAgICBwcmV2aW91c0ltcG9ydCA9IGN1cnJlbnRJbXBvcnRcclxuICB9KVxyXG59XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IHtcclxuICBtZXRhOiB7XHJcbiAgICB0eXBlOiAnc3VnZ2VzdGlvbicsXHJcbiAgICBkb2NzOiB7XHJcbiAgICAgIHVybDogZG9jc1VybCgnb3JkZXInKSxcclxuICAgIH0sXHJcblxyXG4gICAgZml4YWJsZTogJ2NvZGUnLFxyXG4gICAgc2NoZW1hOiBbXHJcbiAgICAgIHtcclxuICAgICAgICB0eXBlOiAnb2JqZWN0JyxcclxuICAgICAgICBwcm9wZXJ0aWVzOiB7XHJcbiAgICAgICAgICBncm91cHM6IHtcclxuICAgICAgICAgICAgdHlwZTogJ2FycmF5JyxcclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgICAnbmV3bGluZXMtYmV0d2Vlbic6IHtcclxuICAgICAgICAgICAgZW51bTogW1xyXG4gICAgICAgICAgICAgICdpZ25vcmUnLFxyXG4gICAgICAgICAgICAgICdhbHdheXMnLFxyXG4gICAgICAgICAgICAgICdhbHdheXMtYW5kLWluc2lkZS1ncm91cHMnLFxyXG4gICAgICAgICAgICAgICduZXZlcicsXHJcbiAgICAgICAgICAgIF0sXHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgYWRkaXRpb25hbFByb3BlcnRpZXM6IGZhbHNlLFxyXG4gICAgICB9LFxyXG4gICAgXSxcclxuICB9LFxyXG5cclxuICBjcmVhdGU6IGZ1bmN0aW9uIGltcG9ydE9yZGVyUnVsZSAoY29udGV4dCkge1xyXG4gICAgY29uc3Qgb3B0aW9ucyA9IGNvbnRleHQub3B0aW9uc1swXSB8fCB7fVxyXG4gICAgY29uc3QgbmV3bGluZXNCZXR3ZWVuSW1wb3J0cyA9IG9wdGlvbnNbJ25ld2xpbmVzLWJldHdlZW4nXSB8fCAnaWdub3JlJ1xyXG4gICAgbGV0IHJhbmtzXHJcblxyXG4gICAgdHJ5IHtcclxuICAgICAgcmFua3MgPSBjb252ZXJ0R3JvdXBzVG9SYW5rcyhvcHRpb25zLmdyb3VwcyB8fCBkZWZhdWx0R3JvdXBzKVxyXG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgICAgLy8gTWFsZm9ybWVkIGNvbmZpZ3VyYXRpb25cclxuICAgICAgcmV0dXJuIHtcclxuICAgICAgICBQcm9ncmFtOiBmdW5jdGlvbihub2RlKSB7XHJcbiAgICAgICAgICBjb250ZXh0LnJlcG9ydChub2RlLCBlcnJvci5tZXNzYWdlKVxyXG4gICAgICAgIH0sXHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIGxldCBpbXBvcnRlZCA9IFtdXHJcbiAgICBsZXQgbGV2ZWwgPSAwXHJcblxyXG4gICAgZnVuY3Rpb24gaW5jcmVtZW50TGV2ZWwoKSB7XHJcbiAgICAgIGxldmVsKytcclxuICAgIH1cclxuICAgIGZ1bmN0aW9uIGRlY3JlbWVudExldmVsKCkge1xyXG4gICAgICBsZXZlbC0tXHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIHtcclxuICAgICAgSW1wb3J0RGVjbGFyYXRpb246IGZ1bmN0aW9uIGhhbmRsZUltcG9ydHMobm9kZSkge1xyXG4gICAgICAgIGlmIChub2RlLnNwZWNpZmllcnMubGVuZ3RoKSB7IC8vIElnbm9yaW5nIHVuYXNzaWduZWQgaW1wb3J0c1xyXG4gICAgICAgICAgY29uc3QgbmFtZSA9IG5vZGUuc291cmNlLnZhbHVlXHJcbiAgICAgICAgICByZWdpc3Rlck5vZGUoY29udGV4dCwgbm9kZSwgbmFtZSwgJ2ltcG9ydCcsIHJhbmtzLCBpbXBvcnRlZClcclxuICAgICAgICB9XHJcbiAgICAgIH0sXHJcbiAgICAgIENhbGxFeHByZXNzaW9uOiBmdW5jdGlvbiBoYW5kbGVSZXF1aXJlcyhub2RlKSB7XHJcbiAgICAgICAgaWYgKGxldmVsICE9PSAwIHx8ICFpc1N0YXRpY1JlcXVpcmUobm9kZSkgfHwgIWlzSW5WYXJpYWJsZURlY2xhcmF0b3Iobm9kZS5wYXJlbnQpKSB7XHJcbiAgICAgICAgICByZXR1cm5cclxuICAgICAgICB9XHJcbiAgICAgICAgY29uc3QgbmFtZSA9IG5vZGUuYXJndW1lbnRzWzBdLnZhbHVlXHJcbiAgICAgICAgcmVnaXN0ZXJOb2RlKGNvbnRleHQsIG5vZGUsIG5hbWUsICdyZXF1aXJlJywgcmFua3MsIGltcG9ydGVkKVxyXG4gICAgICB9LFxyXG4gICAgICAnUHJvZ3JhbTpleGl0JzogZnVuY3Rpb24gcmVwb3J0QW5kUmVzZXQoKSB7XHJcbiAgICAgICAgbWFrZU91dE9mT3JkZXJSZXBvcnQoY29udGV4dCwgaW1wb3J0ZWQpXHJcblxyXG4gICAgICAgIGlmIChuZXdsaW5lc0JldHdlZW5JbXBvcnRzICE9PSAnaWdub3JlJykge1xyXG4gICAgICAgICAgbWFrZU5ld2xpbmVzQmV0d2VlblJlcG9ydChjb250ZXh0LCBpbXBvcnRlZCwgbmV3bGluZXNCZXR3ZWVuSW1wb3J0cylcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGltcG9ydGVkID0gW11cclxuICAgICAgfSxcclxuICAgICAgRnVuY3Rpb25EZWNsYXJhdGlvbjogaW5jcmVtZW50TGV2ZWwsXHJcbiAgICAgIEZ1bmN0aW9uRXhwcmVzc2lvbjogaW5jcmVtZW50TGV2ZWwsXHJcbiAgICAgIEFycm93RnVuY3Rpb25FeHByZXNzaW9uOiBpbmNyZW1lbnRMZXZlbCxcclxuICAgICAgQmxvY2tTdGF0ZW1lbnQ6IGluY3JlbWVudExldmVsLFxyXG4gICAgICBPYmplY3RFeHByZXNzaW9uOiBpbmNyZW1lbnRMZXZlbCxcclxuICAgICAgJ0Z1bmN0aW9uRGVjbGFyYXRpb246ZXhpdCc6IGRlY3JlbWVudExldmVsLFxyXG4gICAgICAnRnVuY3Rpb25FeHByZXNzaW9uOmV4aXQnOiBkZWNyZW1lbnRMZXZlbCxcclxuICAgICAgJ0Fycm93RnVuY3Rpb25FeHByZXNzaW9uOmV4aXQnOiBkZWNyZW1lbnRMZXZlbCxcclxuICAgICAgJ0Jsb2NrU3RhdGVtZW50OmV4aXQnOiBkZWNyZW1lbnRMZXZlbCxcclxuICAgICAgJ09iamVjdEV4cHJlc3Npb246ZXhpdCc6IGRlY3JlbWVudExldmVsLFxyXG4gICAgfVxyXG4gIH0sXHJcbn1cclxuIl19