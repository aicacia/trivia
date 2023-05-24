<script lang="ts">
	export let value: string;
	export let size = 512;

	let qrcode: QRious;
	let element: HTMLDivElement;
	let prevValue: string;
	let prevSize: number;

	$: if (element && !qrcode) {
		prevValue = value;
		prevSize = size;
		qrcode = new window.QRious({
			element: element,
			size,
			value
		});
	}

	$: if (qrcode && prevValue !== value) {
		prevValue = value;
		qrcode.value = value;
	}
	$: if (qrcode && prevSize !== size) {
		prevSize = size;
		qrcode.size = size;
	}
</script>

<img class="inline-block w-100" bind:this={element} alt={value} />
