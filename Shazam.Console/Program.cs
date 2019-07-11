using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using System;
using System.Diagnostics;
using System.Threading;
using Windows.Foundation;

class Program {

    static void Main(string[] _) {
        RegisterWinRt();
        Tag();
    }

    static void RegisterWinRt() {
        var manager = new ManagedHooksManager.HooksManager();
        manager.SetupHooks();
        manager.RegisterWinRtType("ShazamCore.API, ShazamCore, ContentType=WindowsRuntime");
    }

    static void Tag() {
        var api = new ShazamCore.API();
        api.Startup();
        Thread.Sleep(1000); // ?
        api.StartCapture();

        var INSTALLATION_ID = Guid.NewGuid().ToString();
        var tagid = Guid.NewGuid().ToString();

        var arg = new {
            tag = new {
                href = "https://amp.shazam.com/shazam/v3/-/-/android/-/tag/" + INSTALLATION_ID + "/" + tagid,
                minsamplems = 3000,
                maxsamplems = 20000
            },
            tagid,
            data = new {
                signature = new {
                    uri = "data:audio/vnd.shazam.sig;base64,{sigdata}",
                    samplems = "{samplems}"
                }
            }
        };

        Console.Write("Listening");

        var operation = api.Tag(JsonConvert.SerializeObject(arg));
        while(operation.Status == AsyncStatus.Started) {
            Thread.Sleep(1000);
            Console.Write(".");
        }

        Console.WriteLine();

        var resultJSON = operation.GetResults();
        var track = JsonConvert.DeserializeObject<JToken>(resultJSON)
            .Value<JToken>("tag")
            .Value<JToken>("response")
            .Value<JToken>("track");

        if(track != null) {
            var url = track.Value<string>("url");
            Console.WriteLine(url);
            Process.Start("explorer", url);
        } else {
            Console.WriteLine("No matches");
        }
    }
}
