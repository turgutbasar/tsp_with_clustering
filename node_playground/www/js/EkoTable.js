$.fn.EkoTable = function (cfg, drawCallback) {
	var filteringAmount = 100;
	var data = cfg.aaData;
	var filtered = _.take(data, filteringAmount);
	var target = this;
	var selectedItems = [];
	cfg.rowCheckClass = cfg.rowCheckClass || this[0].id + "_check";

	target.addClass("table table-xs table-bordered table-striped dataTable");

	target.attr("width", "100%");

	target.wrap("<div class='table-responsive'></div>");

	target.html("<thead class='border-double'><tr></tr></thead><tfoot><tr></tr></tfoot>");

	if (cfg.showCheckBoxes != undefined && cfg.showCheckBoxes) {
		cfg.aoColumns = _.concat([{
			"mData": "Id",
			"mRender": function (x) {
				return "<center><input type='checkbox' class='styled " + cfg.rowCheckClass + "' id='" + x + "' " + (_.find(selectedItems, function (item) { return item.Id == x; }) == undefined ? '' : 'checked') + " ></center>";
			}, "mDataType": "Command"
		}], cfg.aoColumns);

		target.find("thead tr").html(target.find("thead tr").html() + "<th>Seç</th>");
		target.find("tfoot tr").html(target.find("tfoot tr").html() + "<th></th>");
	}

	if (cfg.showCounter != undefined && cfg.showCounter) {
		cfg.aoColumns = _.concat([{
			"mRender": function (data, type, row) {
				return _.findIndex(filtered, row) + 1;
			}, "mDataType": "Command"
		}], cfg.aoColumns);

		target.find("thead tr").html(target.find("thead tr").html() + "<th>No</th>");
		target.find("tfoot tr").html(target.find("tfoot tr").html() + "<th></th>");
	}

	_(cfg.aoColumns).forEach(function (x) {
		if (x.sTitle == undefined) {
			return;
		}
		target.find("thead tr").html(target.find("thead tr").html() + "<th>" + x.sTitle + "</th>");
		target.find("tfoot tr").html(target.find("tfoot tr").html() + "<th>" + x.sTitle + "</th>");
	});

	target.find('tfoot tr th').each(function () {
		var title = target.find('thead tr th').eq($(this).index()).text();

		if (title == "No")
			return;
		if (title == "Seç")
			return;

		$(this).html('<input id="' + _.snakeCase(title) + '" type="text" class="form-control input-sm" placeholder="' + title + '" />');
	});

	if (cfg.isDeletable != undefined && cfg.isDeletable) {
		target.find("thead tr").html(target.find("thead tr").html() + "<th>Delete</th>");
		target.find("tfoot tr").html(target.find("tfoot tr").html() + "<th></th>");
	}

	if (cfg.rowClickClass != undefined) {

		cfg.columnDefs = (function (len) {
			var colDefs = [];
			var targets = [];
			for (i = 0; i < len - 1; ++i) {
				targets.push(i);
			}
			colDefs.push({
				orderable: true,
				targets: targets,
				className: cfg.rowClickClass,
			});
			if (cfg.isDeletable != undefined && cfg.isDeletable) {
				colDefs.push({
					orderable: false,
					width: '50px',
					targets: [len -1],
				});
			} else {
				colDefs.push({
					orderable: true,
					targets: [len - 1],
					className: cfg.rowClickClass,
				});
			}
			return colDefs;
		})(cfg.aoColumns.length);

	}

	cfg.sAjaxDataProp = "";
	cfg.scrollY = 400;
	cfg.deferRender = true;
	cfg.bPaginate = false;
	cfg.responsive = true;
	cfg.bScrollCollapse = true;
	cfg.scrollX = true;
	cfg.autoWidth = true;
	cfg.dom = '<"datatable-header"ip<"toolbar">><"datatable-scroll"t>';
	cfg.aaData = filtered;
	cfg.buttons= ['colvis'];
	// DataTable Init
	var table = $.fn.DataTable.apply(this, arguments);

	table.dataSource = data;

	table.on('draw.dt', function () {
		if (drawCallback != undefined) {
			drawCallback();
		}
		// Default initialization of check boxes
		$(".styled, .multiselect-container input").uniform({
			radioClass: 'choice'
		});
		$('.' + cfg.rowCheckClass).unbind('change');
		$('.' + cfg.rowCheckClass).on('change', function () {
			var id = this.id;
			if (this.checked) {
				selectedItems.push(_.find(table.dataSource, function (item) { return item.Id == id; }));
			} else {
				selectedItems.pop(_.find(table.dataSource, function (item) { return item.Id == id; }));
			}
		});
	});

	table.columns().every(function () {
		$('input', this.footer()).on('keyup', function () {
			filtered = table.dataSource;

			_(cfg.aoColumns).forEach(function (column) {
				if (column.mDataType == "Command") {
					return true;
				}
				var key = target.closest("div.dataTables_wrapper").find('.dataTables_scrollFootInner').find("#" + _.snakeCase(column.sTitle)).val();
				if (key.length < 1) {
					return true;
				}
				filtered = _.orderBy(_.filter(filtered, function (x) {
					if (column.mDataType == "Boolean") {
						return (column.mBooleanEq[x[column.mData]]).toLowerCase().indexOf(key.toLowerCase()) != -1;
					}
					return x[column.mData].toLowerCase().indexOf(key.toLowerCase()) != -1;
				}), [column.mData]);

			});

			table.clear();
			table.rows.add(_.take(filtered, filteringAmount));
			table.draw();
		});
	});

	table.setToolbar = function (toolbar) {
		var wrapper = target.closest("div.dataTables_wrapper");
		wrapper.find("div.toolbar").replaceWith(toolbar.clone().prop({ id: "_toolbar" }));
		toolbar.remove();
		wrapper.find('#_toolbar').addClass("pull-right");
		wrapper.find('#_toolbar').show();
	}

	table.setData = function (data) {
		table.dataSource = data;
		table.clear();
		table.rows.add(_.take(table.dataSource, filteringAmount));
	}

	table.clearChecks = function () {
		selectedItems = [];
		// Force to re-draw!
		table.clear();
		table.rows.add(_.take(table.dataSource, filteringAmount));
		table.draw();
	}

	table.getSelectedItems = function () {
		return selectedItems;
	}

	return table;
}