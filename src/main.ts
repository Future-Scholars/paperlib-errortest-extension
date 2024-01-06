import { PLAPI, PLExtAPI, PLExtension } from "paperlib-api";

class PaperlibErrorTestExtension extends PLExtension {
  disposeCallbacks: (() => void)[];

  constructor() {
    super({
      id: "@future-scholars/paperlib-errortest-extension",
      defaultPreference: {},
    });

    this.disposeCallbacks = [];
  }

  async initialize() {
    await PLExtAPI.extensionPreferenceService.register(
      this.id,
      this.defaultPreference,
    );

    // throw new Error("This is an error from extension: initialize");

    // 1. Command Extension Example
    this.registerSomeCommands();

    // 2. UI Extension Example
    this.modifyPaperDetailsPanel();

    // 3. Hook Extension Example
    this.hookSomePoints();
  }

  async dispose() {
    PLExtAPI.extensionPreferenceService.unregister(this.id);

    for (const disposeCallback of this.disposeCallbacks) {
      disposeCallback();
    }
  }

  registerSomeCommands() {
    this.disposeCallbacks.push(
      PLAPI.commandService.on("command_echo_error_event" as any, () => {
        throw new Error("This is an error from extension: command_echo_event");
      }),
    );

    // Register a command with event "command_echo_event".
    this.disposeCallbacks.push(
      PLAPI.commandService.registerExternel({
        id: "command_echo_error",
        description: "Hello from the extension process",
        event: "command_echo_error_event",
      }),
    );
  }

  modifyPaperDetailsPanel() {
    this.disposeCallbacks.push(
      PLAPI.uiStateService.onChanged("selectedPaperEntities", (newValues) => {
        throw new Error(
          "This is an error from extension: Event: selectedPaperEntities - modifyPaperDetailsPanel",
        );
      }),
    );
  }

  hookSomePoints() {
    this.disposeCallbacks.push(
      PLAPI.hookService.hookModify(
        "beforeScrapeEntry",
        this.id,
        "modifyPayloads",
      ),
    );
  }

  modifyPayloads(payloads: any[]) {
    // wait for 5 seconds to return
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([payloads]);
      }, 20000);
    });
    // return [payloads];
  }
}

async function initialize() {
  const extension = new PaperlibErrorTestExtension();
  await extension.initialize();

  return extension;
}

export { initialize };
