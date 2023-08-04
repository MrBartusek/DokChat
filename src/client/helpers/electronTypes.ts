declare global {
  interface Window {
    electronAPI: ElectronAPIType
  }
}

interface ElectronAPIType {
	openBrowser(url: string): void
}

export {};
