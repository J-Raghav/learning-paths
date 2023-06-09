import { CircularProgress } from "@mui/material";
import React, { useContext, useEffect, useState } from "react";
import { NavLink, useParams } from "react-router-dom";
import AppContext from "../contexts/AppContext";
import { getModuleById } from "../proxy-service";
import {
  compareHistory,
  formatTimeInMinutes,
  getDerivedPropsLearningPath,
  historyLimit,
  normalizeCamelCase,
} from "../utils";
import CenterComponent from "./Common/CenterComponent";
import LearningPathHeader from "./Common/LearningPathHeader";
import ModuleHeader from "./Common/ModuleHeader";
import NotFound from "./Common/NotFound";
import UnitList from "./Common/UnitList";

export default function ModulePage() {
  const { uid } = useParams();
  const [module, setModule] = useState(undefined);
  const { history, setAppActions } = useContext(AppContext);

  useEffect(() => {
    if (uid) {
      getModuleById(uid).then((result) => setModule(result));
    }
  }, [uid]);

  useEffect(() => {
    if (module) {
      var captionItems = [
        formatTimeInMinutes(module.durationInMinutes),
        normalizeCamelCase(module.type),
        `${module.units.length} Units`,
      ];
      var appActions = {
        history: [
          {
            uid: module.uid,
            type: module.type,
            lastOpened: new Date(),
            title: module.title,
            captionItems,
          },
          ...history
            .filter((item) => item.uid !== module.uid)
            .slice(0, historyLimit - 1),
        ],
      };

      if (!compareHistory(appActions.history, history)) {
        setAppActions(appActions);
      }
    }
  }, [module]);

  if (module === null) {
    return <NotFound />;
  }

  if (module === undefined) {
    return (
      <CenterComponent>
        <CircularProgress className="mx-auto" />
      </CenterComponent>
    );
  }

  return (
    <div>
      <ModuleHeader
        module={module}
        titleSize="h3"
        className="border shadow shadow-sm p-3 p-md-5 m-5 mb-0"
      />
      <div className="row align-items-stretch m-5 mt-0">
        <div className="col-12 col-md-4 border bg-white p-3 p-md-5">
          <div className="">
            <h5 className="h5 mb-3">Units</h5>
            <UnitList units={module.units} />
          </div>
        </div>

        <div className="col-12 col-md-8 border bg-white p-3 p-md-5">
          <div className="">
            <h5 className="h5 mb-3">Related Learning Paths</h5>
            {module.parents?.map((lp) => {
              const headerProps = getDerivedPropsLearningPath(lp);

              return (
                <NavLink
                  key={lp.uid}
                  to={`/learningPath/${lp.uid}`}
                  className={"text-decoration-none"}
                >
                  <LearningPathHeader
                    sx={{
                      ":hover": {
                        outline: "rgba(0, 0, 0, .15) solid 1px;",
                        boxShadow: "0 .5rem 1rem rgba(0, 0, 0, .15);",
                      },
                    }}
                    learningPath={lp}
                    className="align-items-center h-100 p-4"
                    titleSize="h5"
                    hideSummary={true}
                    {...headerProps}
                  />
                </NavLink>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
