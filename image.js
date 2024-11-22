// Name: Image
// ID: lmsImage
// Description: Display images from URLs.
// By: YourName <https://yourprofile.link/>
// License: MIT AND LGPL-3.0

/* generated l10n code */
Scratch.translate.setup({
  "zh-cn": {
    _Image: "图片",
    _load image from URL [URL] as [NAME]: "从URL[URL]加载图片并命名为[NAME]",
    _show image [NAME] on [TARGET]: "在[TARGET]上显示图片[NAME]",
    _delete image [NAME]: "删除图片[NAME]",
    _loaded images: "已加载的图片",
    _image [NAME] is [STATE]?: "图片[NAME]是否[STATE]?",
  },
});

class ImageExtension{
  "use strict";

  const vm = Scratch.vm;
  const runtime = vm.runtime;
  const renderer = vm.renderer;
  const Cast = Scratch.Cast;

  const elementContainer = document.createElement("div");
  elementContainer.className = "tw-extensions-my-images-container";
  elementContainer.style.pointerEvents = "none";
  elementContainer.style.position = "absolute";
  elementContainer.style.opacity = "0";
  elementContainer.style.width = "0";
  elementContainer.style.height = "0";
  elementContainer.style.visibility = "hidden";
  document.body.appendChild(elementContainer);

  class ImageSkin extends Scratch.renderer.exports.BitmapSkin {
    constructor(id, renderer, imageName, imageSrc) {
      super(id, renderer);

      this.imageName = imageName;
      this.imageSrc = imageSrc;

      this.imageError = false;

      this.readyPromise = new Promise((resolve) => {
        this.readyCallback = resolve;
      });

      this.imageElement = new Image();
      this.imageElement.src = imageSrc;
      this.imageElement.crossOrigin = "anonymous"; 
      this.imageElement.onload = () => {
        this.readyCallback();
        this.markImageDirty();
      };

      this.imageElement.onerror = () => {
        this.imageError = true;
        this.readyCallback();
        this.markImageDirty();
      };

      elementContainer.appendChild(this.imageElement);
    }

    markImageDirty() {
      this.emitWasAltered();
    }

    reuploadImage() {
      if (this.imageError) {
        const canvas = document.createElement("canvas");
        canvas.width = 128;
        canvas.height = 128;
        const ctx = canvas.getContext("2d");
        ctx.fillStyle = "#cccccc";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "#000000";
        ctx.font = "40px serif";
        ctx.fillText("?", 64, 64);
        this.setBitmap(canvas);
      } else {
        this.setBitmap(this.imageElement);
      }
    }

    get size() {
      if (this.imageError) {
        return [128, 128];
      }
      return super.size;
    }

    dispose() {
      super.dispose();
      this.imageElement.src = "";
    }
  }

  class ImageExtension {
    constructor() {
      this.images = Object.create(null);

      runtime.on("PROJECT_STOP_ALL", () => this.resetEverything());
      runtime.on("PROJECT_START", () => this.resetEverything());
    }

    getInfo() {
      return {
        id: "lmsImage",
        color1: "#FF4081",
        name: Scratch.translate("Image"),
        blocks: [
          {
            opcode: "loadImageFromURL",
            blockType: Scratch.BlockType.COMMAND,
            text: Scratch.translate("load image from URL [URL] as [NAME]"),
            arguments: {
              URL: { type: Scratch.ArgumentType.STRING, defaultValue: "https://example.com/image.png" },
              NAME: { type: Scratch.ArgumentType.STRING, defaultValue: "my image" },
            },
          },
          {
            opcode: "deleteImage",
            blockType: Scratch.BlockType.COMMAND,
            text: Scratch.translate("delete image [NAME]"),
            arguments: {
              NAME: { type: Scratch.ArgumentType.STRING, defaultValue: "my image" },
            },
          },
          {
            opcode: "getLoadedImages",
            blockType: Scratch.BlockType.REPORTER,
            text: Scratch.translate("loaded images"),
          },
          {
            opcode: "showImage",
            blockType: Scratch.BlockType.COMMAND,
            text: Scratch.translate("show image [NAME] on [TARGET]"),
            arguments: {
              TARGET: {
                type: Scratch.ArgumentType.STRING,
                menu: "targets",
              },
              NAME: { type: Scratch.ArgumentType.STRING, defaultValue: "my image" },
            },
          },
        ],
        menus: {
          targets: {
            acceptReporters: true,
            items: "_getTargets",
          },
        },
      };
    }

    resetEverything() {
      for (const imageName in this.images) {
        const imageSkin = this.images[imageName];
        if (imageSkin) {
          imageSkin.dispose();
          Reflect.deleteProperty(this.images, imageName);
        }
      }
    }

    async loadImageFromURL(args) {
      this.deleteImage(args);

      const imageName = Cast.toString(args.NAME);
      const url = Cast.toString(args.URL);

      if (!(await Scratch.canFetch(url))) return;

      const skinId = renderer._nextSkinId++;
      const skin = new ImageSkin(skinId, renderer, imageName, url);
      renderer._allSkins[skinId] = skin;
      this.images[imageName] = skin;

      return skin.readyPromise;
    }

    deleteImage(args) {
      const imageName = Cast.toString(args.NAME);
      const imageSkin = this.images[imageName];
      if (!imageSkin) return;

      renderer.destroySkin(imageSkin.id);
      Reflect.deleteProperty(this.images, imageName);
    }

    getLoadedImages() {
      return JSON.stringify(Object.keys(this.images));
    }

    showImage(args, util) {
      const targetName = Cast.toString(args.TARGET);
      const imageName = Cast.toString(args.NAME);
      const target = this._getTargetFromMenu(targetName, util);
      const imageSkin = this.images[imageName];
      if (!target || !imageSkin) return;

      vm.renderer.updateDrawableSkinId(target.drawableID, imageSkin.id);
    }

    _getTargetFromMenu(targetName, util) {
      if (targetName === "_myself_") return util.target;
      if (targetName === "_stage_") return runtime.getTargetForStage();
      return runtime.getSpriteTargetByName(targetName);
    }

    _getTargets() {
      const spriteNames = [
        { text: "myself", value: "_myself_" },
        { text: "Stage", value: "_stage_" },
      ];
      const targets = runtime.targets.filter(target => target.isOriginal && !target.isStage)
                                     .map(target => target.getName());
      return spriteNames.concat(targets);
    }
  }

  Scratch.extensions.register(new ImageExtension());
})(Scratch);
