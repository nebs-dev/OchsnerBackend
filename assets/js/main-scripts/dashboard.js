$(function () {
  if ($("section.dashboard").length) {


    // todo remove me pls
    $(".alertMe").click(function () {
      alert("Coming soon!");
    });


    /* core functions for graphs START*/
    function getChartData(options, callback) {
      $.get(options.url, function (chartData) {
        if (chartData) {

          chartData.expires = moment().add(parseInt(moment().endOf('day').fromNow(true), 10), "h").format();
          localStorage[options.storageKey] = JSON.stringify(chartData);

          callback(chartData);

        } else {
          alert("Graph fetch data error."); //todo make this rigth
        }
      });
    }


    function generateGraph(options) {
      var renderChartData = {
        labels: options.chartData.labels,
        datasets: [{
          fillColor: "rgba(151,187,205,0.2)",
          strokeColor: "rgba(151,187,205,1)",
          pointColor: "rgba(151,187,205,1)",
          pointStrokeColor: "#fff",
          pointHighlightFill: "#fff",
          pointHighlightStroke: "rgba(151,187,205,1)",
          data: options.chartData.data
        }]
      };

      options.container.parent().find(".charts-preloader").fadeOut();

      if (options.chartType === "bar") {
        new Chart(options.container[0].getContext("2d")).Bar(renderChartData, options.chartOptions);
      } else {
        new Chart(options.container[0].getContext("2d")).Line(renderChartData, options.chartOptions);
      }

    }

    /* core functions for graphs END */


    /* appSessions chart START */
    var appSessionsChart = localStorage.appSessions ? JSON.parse(localStorage.appSessions) : false;

    if (appSessionsChart && moment().isBefore(appSessionsChart.expires)) {
      generateGraph({
        chartData: appSessionsChart,
        chartOptions: {
          responsive: true,
          pointHitDetectionRadius: 0
        },
        chartType: "line",
        container: $("#appSessions")
      });
    } else {

      getChartData({
        url: "/analytics/GAsessions",
        storageKey: "appSessions"
      }, function (chartData) {
        generateGraph({
          chartData: chartData,
          chartOptions: {
            responsive: true,
            pointHitDetectionRadius: 0
          },
          chartType: "line",
          container: $("#appSessions")
        });
      });

    }
    /* appSessions chart END */


    /* appDownloads chart START */
    var appDownloadsChart = localStorage.appDownloads ? JSON.parse(localStorage.appDownloads) : false;

    if (appDownloadsChart && moment().isBefore(appDownloadsChart.expires)) {
      generateGraph({
        chartData: appDownloadsChart,
        chartOptions: {
          responsive: true,
          pointHitDetectionRadius: 0
        },
        chartType: "line",
        container: $("#appDownloads")
      });

      $(".totalDownloads").html(localStorage.totalDownloads ? localStorage.totalDownloads : "error");

    } else {

      getChartData({
        url: "/analytics/iTunesConnect",
        storageKey: "appDownloads"
      }, function (chartData) {
        generateGraph({
          chartData: chartData,
          chartOptions: {
            responsive: true,
            pointHitDetectionRadius: 0
          },
          chartType: "line",
          container: $("#appDownloads")
        });

        // one more request to get total number of downloads

        console.log("tu sam");
        $.get("/analytics/iTunesConnect?getAll=true", function (totalDownloads) {
          $(".totalDownloads").html(totalDownloads.data);
          localStorage.totalDownloads = totalDownloads.data;
        });


      });

    }
    /* appDownloads chart END */


    $.get("/analytics/userStats", function (data) {
      $(".analytics-getSignUp").html(data.signUp || "0");
      $(".analytics-getSignIn").html(data.signIn || "0");

    });

    $.get("/analytics/cardStats", function (data) {
      $(".analytics-getAvailableCards").html(data.availableCards || "0");
    });


    function getRealtimeUsers() {

      $.get("/analytics/GAcurrentUsers", function (data) {
        $(".analytics-getActiveUsers").html(data["rt:activeUsers"] || "0");
      });
    }

    setInterval(getRealtimeUsers, 60 * 1000);
    getRealtimeUsers();


  } // is dashboard end
});
