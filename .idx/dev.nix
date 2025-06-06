{ pkgs, ... }: {
  channel = "stable-24.05";

  packages = [
    pkgs.nodejs_20
  ];

  idx = {
    previews = {
      enable = true;
      previews = {
        web = {
          command = ["npx" "live-server" "--port=$PORT" "--host=0.0.0.0"];
          manager = "web";
        };
      };
    };
  };
}