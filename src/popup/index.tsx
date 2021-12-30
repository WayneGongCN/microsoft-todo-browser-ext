import React, { Suspense } from "react";
import { Provider } from "react-redux";
import Container from "@material-ui/core/Container";
import { render } from "react-dom";
import { logger } from "../helpers/logger";
import { EThemes, loadTheme } from "../themes";
import { BackgroundContext } from "../../types";
import report from '../helpers/report'
import { Page } from "../constants/enums";

report(Page.POPUP)

export let backgroundContext: BackgroundContext;

logger.time('getBackgroundPage')
chrome.runtime.getBackgroundPage(async (ctx: any) => {
  logger.timeEnd("getBackgroundPage");
  logger.time("firstRender");
  logger.time("theme");
  logger.log('show popup')

  logger.log("background ctx: ", ctx);
  backgroundContext = ctx.backgroundContext;

  const themeName = EThemes.DEFAULT;
  const Theme = loadTheme(themeName);
  logger.log("theme: ", themeName);

  render(
    <Provider store={backgroundContext.store}>
      <Container disableGutters>
        <Suspense fallback={<div>{logger.timeEnd("firstRender")}Loading</div>}>
          <Theme />
        </Suspense>
      </Container>
    </Provider>,
    document.getElementById("root")
  );
});
