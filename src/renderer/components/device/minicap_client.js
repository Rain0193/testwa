import { BannerParser } from "minicap";

export default canvas => {
  let banner = null;
  let data = [];
  const g = canvas.getContext("2d");
  require("net")
    .connect({ port: 1717 })
    .on("data", chunk => {
      // @ts-ignore
      data.push(...chunk);
      if (banner === null) {
        const parser = new BannerParser();
        parser.parse(data.splice(0, 24));
        banner = parser.take();
        console.log(banner);
      } else {
        const arr = data.slice(0, 4);
        const size =
          (arr[3] << 24) | (arr[2] << 16) | (arr[1] << 8) | (arr[0] << 0);
        if (data.length >= size + 4) {
          const chunk = data.slice(4, 4 + size);
          const img = new Image();
          img.onload = () => {
            canvas.width = img.width;
            canvas.height = img.height;
            g.drawImage(img, 0, 0);
          };
          img.src =
            "data:image/png;base64," + Buffer.from(chunk).toString("base64");
          data = data.slice(4 + size);
        }
      }
    });
};
