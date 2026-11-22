import { addons } from "storybook/manager-api";
import { cofrinhoTheme } from "./theme";

addons.setConfig({ theme: cofrinhoTheme, sidebar: { showRoots: true } });
