import { TemplateFolder, TemplateItem, TemplateFile } from "../../playground/lib/path-to-json";

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

export type WebContainerFileSystem = Record<string, WebContainerFile | WebContainerDirectory>;

export function transformToWebContainerFormat(template: TemplateFolder): WebContainerFileSystem {
  function processItem(item: TemplateItem): WebContainerFile | WebContainerDirectory {
    if ('folderName' in item && 'items' in item) {
      // This is a directory
      const directoryContents: WebContainerFileSystem = {};
      
      item.items.forEach(subItem => {
        const key = 'fileExtension' in subItem && subItem.fileExtension
          ? `${subItem.filename}.${subItem.fileExtension}`
          : (subItem as TemplateFolder).folderName;
        directoryContents[key] = processItem(subItem);
      });

      return {
        directory: directoryContents
      };
    } else {
      // This is a file
      const file = item as TemplateFile;
      return {
        file: {
          contents: file.content
        }
      };
    }
  }

  const result: WebContainerFileSystem = {};
  
  template.items.forEach(item => {
    const key = 'fileExtension' in item && item.fileExtension 
      ? `${item.filename}.${item.fileExtension}`
      : (item as TemplateFolder).folderName;
    result[key] = processItem(item);
  });

  return result;
}