import React, { Suspense, useEffect, useRef } from "react";
import { Provider } from "react-redux";
import Container from "@material-ui/core/Container";
import { render } from "react-dom";
import {
  BackgroundContext,
} from "../types";
import { logger } from "../helpers/logger";
import { EThemes, loadTheme } from "../themes";

export let backgroundContext: BackgroundContext

chrome.runtime.getBackgroundPage(async (ctx: any) => {
  logger.log("background ctx: ", ctx);
  backgroundContext = ctx.backgroundContext;

  const themeName = EThemes.DEFAULT;
  const Theme = loadTheme(themeName);
  logger.log('theme: ', themeName)

  render(
    <Provider store={backgroundContext.store}>
      <Suspense fallback={<div>Loading</div>}>
        <Container style={{ width: 350, padding: "8px" }}>
          <Theme />
        </Container>
      </Suspense>
    </Provider>,
    document.getElementById("root")
  );
});
