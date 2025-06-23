{
  description = "Akira Development Environment";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs = { self, nixpkgs, flake-utils, ... }:
  flake-utils.lib.eachDefaultSystem (system:
    let
      pkgs = import nixpkgs {
        inherit system;
      };

    in {
      devShells.default = pkgs.mkShell {
        buildInputs = [
          pkgs.nodejs_24
          pkgs.python3
          pkgs.pkg-config
          pkgs.pnpm
          pkgs.direnv
          pkgs.openssl
          pkgs.sqlite
          pkgs.gcc
        ];

        shellHook = ''
          export npm_config_python="${pkgs.python3}/bin/python3"
        '';
      };
    }
  );
}
