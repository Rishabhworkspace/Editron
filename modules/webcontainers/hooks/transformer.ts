interface TemplateItem {
  filename: string;
  fileExtension: string;
  content: string;
  folderName?: string;
  items?: TemplateItem[];
}

interface WebContainerFile {
  file: {
    contents: string;
  };
}

interface WebContainerDirectory {
  directory: {
    [key: string]: WebContainerFile | WebContainerDirectory;
  };
}

type WebContainerFileSystem = Record<string, WebContainerFile | WebContainerDirectory>;

/**
 * Determine the filesystem key for a TemplateItem.
 *
 * Folders are identified by the presence of both `folderName` and `items`.
 * Everything else is treated as a file — including extension-less files such
 * as `README` or `Makefile` where `fileExtension` is an empty string.
 */
function itemKey(item: TemplateItem): string {
  if ('folderName' in item && item.folderName && 'items' in item && item.items) {
    return item.folderName;
  }
  // File: append the extension only when it is a non-empty string.
  return item.fileExtension
    ? `${item.filename}.${item.fileExtension}`
    : item.filename;
}

export function transformToWebContainerFormat(template: { folderName: string; items: TemplateItem[] }): WebContainerFileSystem {
  function processItem(item: TemplateItem): WebContainerFile | WebContainerDirectory {
    if ('folderName' in item && item.folderName && 'items' in item && item.items) {
      // This is a directory
      const directoryContents: WebContainerFileSystem = {};
      
      item.items.forEach(subItem => {
        directoryContents[itemKey(subItem)] = processItem(subItem);
      });

      return {
        directory: directoryContents
      };
    } else {
      // This is a file
      return {
        file: {
          contents: item.content
        }
      };
    }
  }

  const result: WebContainerFileSystem = {};
  
  template.items.forEach(item => {
    result[itemKey(item)] = processItem(item);
  });

  return result;
}