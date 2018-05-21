/*
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * See the NOTICE file distributed with this work for additional
 * information regarding copyright ownership.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package io.appium.uiautomator2.handler;

import android.content.Context;
import android.content.pm.ApplicationInfo;
import android.content.pm.PackageInfo;
import android.content.pm.PackageManager;
import android.support.test.InstrumentationRegistry;

import org.json.JSONException;
import org.json.JSONObject;

import java.util.ArrayList;
import java.util.List;

import io.appium.uiautomator2.handler.request.SafeRequestHandler;
import io.appium.uiautomator2.http.AppiumResponse;
import io.appium.uiautomator2.http.IHttpRequest;
import io.appium.uiautomator2.server.WDStatus;
import io.appium.uiautomator2.utils.Logger;

/**
 * This handler is used to get the size of elements that support it.
 */
public class GetApplicationInfo extends SafeRequestHandler {

    public GetApplicationInfo(String mappedUri) {
        super(mappedUri);
    }

    @Override
    public AppiumResponse safeHandle(IHttpRequest request) {
        Logger.info("GetApplicationInfo");

        return new AppiumResponse(getSessionId(request), WDStatus.SUCCESS, getApplicationName());
    }
    public List getApplicationName() {
        List apps = new ArrayList<>();
        Context context = InstrumentationRegistry.getContext();
        PackageManager packageManager = context.getPackageManager();
        List<PackageInfo> packs = packageManager.getInstalledPackages(0);
        for (PackageInfo pi : packs) {
            //显示用户安装的应用程序，而不显示系统程序
            if ((pi.applicationInfo.flags & ApplicationInfo.FLAG_SYSTEM) == 0 && (pi.applicationInfo.flags & ApplicationInfo.FLAG_UPDATED_SYSTEM_APP) == 0) {
//                App app = new App();
//                // 版本
//                app.setAppVersion(pi.versionName);
//                // 应用程序名称
//                app.setAppName(pi.applicationInfo.loadLabel(pm).toString());
//                // 应用程序包名
//                app.setAppPackageName(pi.applicationInfo.packageName);
                apps.add(pi.applicationInfo.loadLabel(packageManager).toString());
            }
        }
        return apps;
    }

}
